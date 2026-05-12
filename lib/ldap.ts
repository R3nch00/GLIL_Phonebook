import ldap from 'ldapjs'

const LDAP_URL = process.env.LDAP_URL!
const LDAP_BASE_DN = process.env.LDAP_BASE_DN!
const LDAP_BIND_DN = process.env.LDAP_BIND_DN!
const LDAP_BIND_PASSWORD = process.env.LDAP_BIND_PASSWORD!

export async function searchEmployees(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: LDAP_URL })

    client.bind(LDAP_BIND_DN, LDAP_BIND_PASSWORD, (err) => {
      if (err) {
        client.destroy()
        return reject(err)
      }

      const results: any[] = []

      client.search(LDAP_BASE_DN, {
        filter: '(objectClass=person)',
        scope: 'sub',
        attributes: [
          'cn',           // full name — may differ, ask IT
          'displayName',  // alternative full name
          'mail',         // email
          'telephoneNumber',    // work phone/extension
          'mobile',             // mobile number
          'department',         // department
          'title',              // designation/job title
          'ipPhone',            // IP address — may differ
        ]
      }, (err, res) => {
        if (err) {
          client.destroy()
          return reject(err)
        }

        res.on('searchEntry', (entry) => {
          results.push(entry.pojo.attributes)
        })

        res.on('error', (err) => {
          client.destroy()
          reject(err)
        })

        res.on('end', () => {
          client.destroy()
          resolve(results)
        })
      })
    })
  })
}