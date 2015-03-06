module.exports = {

    'db_url'        : 'mongodb://localhost:27017/medturk',
    'api_url'       : 'https://localhost',
    'ui_path'       : '../ui',
    'secret_key'    : 'replace me with a secret key',
    'datasets_path' : '/medturk/datasets/',
    'cert_path' 	: './security/medturk-cert.pem',
    'key_path' 		: './security/medturk-key.pem',
    'ldap_url'      : 'ldaps://directory.placeholder.edu',
    'ldap_dn'       : 'ou=People,dc=placeholder,dc=edu',
    'use_ldap'		: false
}
