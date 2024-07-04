<b>Target</b>: Create a simple real-time search box (filtering and showing results in a data table for each input change).

<b>Dataset</b>: The sample data contains information on 100,000 employees. Each record has the following fields: ID, Name, Gender, Age, Country, Email, Address, Phone number, and Quote.

<b>Library</b>: [Cheetah Grid]([https://jsfiddle.net/trieuduc1996/8wxagr1u/15/](https://github.com/future-architect/cheetah-grid)) (for visualizing results)

<b>Caution</b>: To enable real-time search and visualization, the data must be downloaded to the front-end beforehand. There are security risks, so this should only be used with trusted devices/users.

For example, in my case: company employees must use company computers, access via VPN, and must be granted access to the employee list page (permissions are also granted for each sensitive information field).

Live demo: [https://jsfiddle.net/trieuduc1996/8wxagr1u/15/](https://jsfiddle.net/trieuduc1996/8wxagr1u/15/)

<b>Simple search</b>: case-insensitive, terms are separated by space
- gmail.com -> 16,900 users use @gmail.com
<br>![gmail.gif](https://raw.githubusercontent.com/ducbet/cheetahGridDemo/update_readme/readme_resources/gmail.gif)
- Andrew jones -> search all fields with each term ("Andrew" and "jones" can be in two different fields).
<br>![aj.gif](https://raw.githubusercontent.com/ducbet/cheetahGridDemo/update_readme/readme_resources/aj.gif)

<b>Phrase search</b> (contains spaces): use parentheses `()`
- (andrew jones) -> search all fields with the phrase "andrew jones" (case-insensitive)
<br>![aj_parentheses.gif](https://raw.githubusercontent.com/ducbet/cheetahGridDemo/update_readme/readme_resources/aj_parentheses.gif)

<b>Exact search</b>: use double quotes `""`
- "Male" -> match exactly "Male"
<br>![Male_db.gif](https://raw.githubusercontent.com/ducbet/cheetahGridDemo/update_readme/readme_resources/Male_db.gif)
- "Andrew Jones" -> search all fields with the phrase "Andrew Jones" (case-sensitive)
<br>![Andrew_Jones_db.gif](https://raw.githubusercontent.com/ducbet/cheetahGridDemo/update_readme/readme_resources/Andrew_Jones_db.gif)

<b>Search in a specific field</b>: use colon `:`
- 26 -> 26 (number) can appear in Age, Address, or Quote fields
- 26:age -> only includes users who are 26 years olds
<br>![26.gif](https://raw.githubusercontent.com/ducbet/cheetahGridDemo/update_readme/readme_resources/26.gif)

<b>Field name suggestions</b>: use colon `:`
- jone: -> show all fields
<br>![jone_name.gif](https://raw.githubusercontent.com/ducbet/cheetahGridDemo/update_readme/readme_resources/jone_name.gif)

<b>Combine multiple conditions</b>: separate by spaces
- "Male":gender -> 49,971 matches
- "Male":gender 26:age -> 645 matches
- "Male":gender 26:age (Viet Nam):country -> 131 matches
- "Male":gender 26:age (Viet Nam):country 012345678900 -> 1 match
<br>![combine.gif](https://raw.githubusercontent.com/ducbet/cheetahGridDemo/update_readme/readme_resources/combine.gif)

<b>predefined criteria</b>: Double-click on the icon
- double-click on the Vietnam flag -> "Viet Nam"
- double-click on the male icon -> "Male"
<br>![double_click.gif](https://raw.githubusercontent.com/ducbet/cheetahGridDemo/update_readme/readme_resources/double_click.gif)
