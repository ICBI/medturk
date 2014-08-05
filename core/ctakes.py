#!/usr/bin/env python

'''
    Author:       Robert M. Johnson <rmj49@georgetown.edu>
    Organization: ICBI, Georgetown University <http://icbi.georgetown.edu>
    
    Description:  This file contains all logic related to retrieving, parsing, and modeling data as generated from cTAKES
'''


from medturk.db import umls
import xml.etree.cElementTree as ET


class cTAKES(object):
    def __init__(self, xml_as_string):
            
        # Parse into tree structure
        self._root = ET.fromstring(xml_as_string)
        
        # Pull out text which analysis was performed on
        sofa             = self._root.find('uima.cas.Sofa')
        self._text       = sofa.get('sofaString')
    
    
    def get_text(self):
        return self._text
    
    def _is_valid(self, s):
        '''
            cTAKES performs... 
                subject analysis   (e.g. Tylenol was given to patient's father)
                negation detection (e.g. Patient was not diagnosed with astrocytoma)
                confidence         (i.e. how confident cTAKES thinks this is correct)
            
        '''
        confidence = float(s.get('confidence'))
        polarity   = int(s.get('polarity'))
        subject    = s.get('subject')
            
        return (confidence == 1.0 and polarity == 1 and subject == 'patient')
    

    def _get_ids(self, ref_ontology_concept_arr, is_treament):
        '''
            One phrase in text can be associated with several different concept Ids
        '''
        
        ids = []
        
        fsarrays = self._root.findall('uima.cas.FSArray')
        if fsarrays != None:
            for fsarray in fsarrays:
                if fsarray.get('_id') == ref_ontology_concept_arr:
                    for i in fsarray:
                 
                        ref_sems = self._root.findall('org.apache.ctakes.typesystem.type.refsem.' + ('Ontology' if is_treament else 'Umls') +'Concept')
                        if ref_sems != None:
                            for ref_sem in ref_sems:
                                
                                if ref_sem.get('_id') == i.text:
                                    
                                    id = ref_sem.get('code' if is_treament else 'cui')
                                    if id != None:
                                        ids.append(id)
    
        # Dedupes Ids before returning
        return list(set(ids))



    def get_sentences(self):
        '''
                Returns all of the sentences found and their offsets
        '''
        
        s = []
        sentences = self._root.findall('org.apache.ctakes.typesystem.type.textspan.Sentence')
        for sentence in sentences:
            
            # Where did this sentence begin and end relative to entire text?
            s_beg = int(sentence.get('begin'))
            s_end = int(sentence.get('end'))
            index = int(sentence.get('sentenceNumber'))
                        
            s.append({'s_beg' : s_beg, 's_end' : s_end, 'index' : index, 'sentence' : self._text[s_beg:s_end]})
        return s


    def _get_tokens_from_sentence(self, sentence_begin, sentence_end):
        '''
                Returns tokens for the given sentence
        '''

        _tokens = []

        tokens = self._root.findall('org.apache.ctakes.typesystem.type.syntax.WordToken')

        for token in tokens:
            
            # Where did this sentence begin and end relative to entire text?
            token_begin = int(token.get('begin'))
            token_end = int(token.get('end'))

            if sentence_begin <= token_begin and token_end <= sentence_end:
                _tokens.append(token.get('normalizedForm'))

        return _tokens
    


    def _get_dict_for_trigger(self, begin, end, trigger):
        
        '''
            Takes a org.apache.ctakes.assertion.medfacts.types.Concept
            and returns the sentence it appeared in
        '''
        d = dict()
        sentences = self._root.findall('org.apache.ctakes.typesystem.type.textspan.Sentence')
        for sentence in sentences:
            
            s_begin = int(sentence.get('begin'))
            s_end   = int(sentence.get('end'))

            tokens = self._get_tokens_from_sentence(s_begin, s_end)
            
            if begin >= s_begin and end <= s_end:
                
                d['kwic']     = self._text[s_begin:s_end]
                d['beg_kwic'] = begin - s_begin
                d['end_kwic'] = end - s_begin
                d['beg']      = begin
                d['end']      = end
                d['trigger']  = trigger
                d['tokens']   = tokens
                break
        return d
    

    
    def get_annotations(self):
        '''
            Returns dictionary where id is usually a CUI from UMLS
            dictionary holds an array as defined below:
            [mention_type, type, text, count, [kwic]]
            
            mention_type:
                The mention type is either SignSymptomMention, DiseaseDisorderMention, ..
            type:
                Could be either "PROBLEM", "TEST", ...
            text:
                Text is a good representative of the CUI as found in the note
            count:
                How many times references to this CUI was found in the note
        '''
        
        text_sem = self._get_text_segments()
        
        annotations = []
        
        concepts = self._root.findall('org.apache.ctakes.assertion.medfacts.types.Concept')
        if concepts != None:
            for concept in concepts:


                type         = concept.get('conceptType')
                mention_type = ''
                trigger      = concept.get('conceptText')
                entity_id    = concept.get('originalEntityExternalId')
                begin        = int(concept.get('begin'))
                end          = int(concept.get('end'))
                d            = self._get_dict_for_trigger(begin, end, trigger)
                
                # Now we find all of the ids associated with this concept
                ids = []
                for ts in text_sem:
                    if (ts.get('_id') == entity_id) and self._is_valid(ts):
                        
                        ids = self._get_ids(ts.get('_ref_ontologyConceptArr'), type == 'TREATMENT')
                        mention_type = self._get_mention_type(ts.tag)
                        break

                # Now, build an annotation for each id found
                for id in ids:
                    
                    name = umls.get_name_from_cui(id)
                
                    # If unable to find an official name, we will have to use trigger
                    if name == None:
                        name = trigger
  
                    annotation = {
                                  'cui'    : id,
                                  'name'   : name
                                  }
                    
                    annotation.update(d)
                    annotations.append(annotation)
    
    
        return annotations
                    
    
    def _get_mention_type(self, tag):
        mention_type =  tag.split('.')[-1][:-7]
        return mention_type
    
    def _get_text_segments(self):
        text_segments = []
        tags = ['org.apache.ctakes.typesystem.type.textsem.DiseaseDisorderMention',
                'org.apache.ctakes.typesystem.type.textsem.SignSymptomMention',
                'org.apache.ctakes.typesystem.type.textsem.MedicationMention',
                'org.apache.ctakes.typesystem.type.textsem.ProcedureMention',
                'org.apache.ctakes.typesystem.type.textsem.AnatomicalSiteMention']
        
        for tag in tags:
            ts = self._root.findall(tag)
            if ts != None:
                text_segments.extend(ts)
        return text_segments


if __name__ == '__main__':
    pass




