// list of vulnerability classes or categories
module.exports = [
    { value: 'Ajax header', display: 'Ajax Header Manipulation' },
    { value: 'HTTP Param Pollution', display: 'Client-Side HTTP Parameter Pollution' },
    { value: 'CORS All', display: 'Cross Origin Resource Sharing (CORS) - All Subdomains Trusted' },
    { value: 'CORS Arb', display: 'Cross Origin Resource Sharing (CORS) - Arbitrary Subdomains Trusted' },
    { value: 'CSRF', display: 'Cross Site Request Forgery (CSRF)' },
    { value: 'XSS', display: 'Cross Site Scripting' },
    { value: 'Expression Lang', display: 'Expression Language Injection' },
    { value: 'File Traversal', display: 'File Path Traversal' },
    { value: 'Request Smuggling', display: 'HTTP Request Smuggling' },
    { value: 'HTTP Response Header', display: 'HTTP Response Header Injection' },
    { value: 'LDAP', display: 'LDAP Injection' },
    { value: 'Open Redirection', display: 'Open Redirection' },
    { value: 'OS Cmd Inj', display: 'OS Command Injection' },
    { value: 'SSRF', display: 'Server Side Request Forgery (SSRF)' },
    { value: 'Server Temp Inj', display: 'Server Side Template Injection' },
    { value: 'Server Proto Pollution', display: 'Server Side Prototype Pollution' },
    { value: 'SQLi', display: 'SQL Injection' }
];