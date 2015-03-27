module.exports = {

    'db_url'        : 'mongodb://localhost:27017/medturk?ssl=true&sslAllowInvalidCertificates=true',
    'api_url'       : 'https://localhost',
    'ui_path'       : '../ui',
    'secret_key'    : 'replace me with a secret key',
    'datasets_path' : '../datasets/',
    'cert_path'     : './security/medturk-cert.pem',
    'key_path'      : './security/medturk-key.pem',
    'ldap_url'      : 'ldaps://ldap.example.edu',
    'ldap_dn'       : 'ou=People,dc=my_dc,dc=edu',
    'use_ldap'      : false
}
