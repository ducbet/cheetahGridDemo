<b>Target</b>: Create a simple real-time search box (filtering and showing results in a data table for each input change).

<b>Dataset</b>: Sample data contains 100,000 records. Each record has the following fields: ID, Name, Gender, Age, Country, Email, Address, Phone number, Quote.

<b>Caution</b>: To enable real-time search and visualization, the data must be downloaded to the front-end beforehand. There are security risks, so this should only be used with trusted devices/users.

For example, in my case: company employees must use company computers, access via VPN, and must be granted access to the employee list page (permissions are also granted for each sensitive information field).

Live demo: [https://jsfiddle.net/trieuduc1996/8wxagr1u/15/](https://jsfiddle.net/trieuduc1996/8wxagr1u/15/)

<b>Simple search</b>: case-insensitive, terms are separated by space
- gmail.com -> 16,900 users use @gmail.com
- jone -> search "jone" in all fields. "jone" can be in the Name, Email, Address, or Quote fields
- Andrew Jones -> search all fields with each term ("Andrew" and "Jones" can be in two different fields).
- male -> no users are filtered because it is case-insensitive -> both "male" and "female" are match

<b>Phrase search</b> (contains spaces): use parentheses `()`
- (andrew jones) -> search all fields with the phrase "andrew jones" (case-insensitive)

<b>Exact search</b>: use double quotes `""`
- "Male" -> match exactly "Male"
- "Andrew Jones" -> search all fields with the phrase "Andrew Jones" (case-sensitive)

<b>Search in a specific field</b>: use colon `:`
- 26 -> 26 (number) can appear in Age, Address, or Quote fields
- 26:age -> only includes users who are 26 years olds
- mal:name -> only includes users whose name contains "mal" (case-insensitive)

<b>Field name suggestions</b>: use colon `:`
- jone: -> show all fields

<b>Combine multiple conditions</b>: separate by spaces
- "Male":gender -> 49,971 matches
- "Male":gender 26:age -> 645 matches
- "Male":gender 26:age (Viet Nam):country -> 131 matches
- "Male":gender 26:age (Viet Nam):country 012345678900 -> 1 match

<b>predefined criteria</b>: Double-click on the icon
- double-click on the Vietnam flag -> "Viet Nam"
- double-click on the male icon -> "Male"
