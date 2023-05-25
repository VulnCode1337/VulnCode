// list of vulnerability classes or categories
module.exports = [
    { value: 'Ajax header', display: 'Ajax Header Manipulation' },
    { value: 'HTTP Param Pollution', display: 'Client-Side HTTP Parameter Pollution' },
    { value: 'CORS', display: 'Cross Origin Resource Sharing (CORS)' },
    { value: 'CSRF', display: 'Cross Site Request Forgery (CSRF)' },
    { value: 'XSS', display: 'Cross Site Scripting (XSS)' },
    { value: 'Directory Traversal', display: 'Directory Traversal' },
    { value: 'Request Smuggling', display: 'HTTP Request Smuggling' },
    { value: 'HTTP Response Header', display: 'HTTP Response Header Injection' },
    { value: 'LDAP', display: 'LDAP Injection' },
    { value: 'LFI', display: 'Local File Inclusion (LFI)' },
    { value: 'Open Redirection', display: 'Open Redirection' },
    { value: 'OS Cmd Inj', display: 'OS Command Injection' },
    { value: 'SSRF', display: 'Server Side Request Forgery (SSRF)' },
    { value: 'Server Temp Inj', display: 'Server Side Template Injection' },
    { value: 'Server Proto Pollution', display: 'Server Side Prototype Pollution' },
    { value: 'SQLi', display: 'SQL Injection' }
];