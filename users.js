fetchUsers();

var grid = null;
var filterDataSource = new cheetahGrid.data.FilterDataSource(new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray([])));

class Counter {
    constructor() {
        this.countChunkSize = 1000;
        this.filterId = 0;

        this.allUsers = 0;
        this.showingUsers = 0;

        this.black = "#000";
        this.gray = "#D3D3D3";
    }

    setLabels() {
        this.allUsersLabel = $("#count-user");
        this.showingUsersLabel = $("#count-showing");
    }

    updateLabels() {
        this.allUsersLabel.text(this.allUsers);
        this.showingUsersLabel.text(this.showingUsers);
        this.changeLabelsColor(this.black);
    }

    changeLabelsColor(color) {
        this.showingUsersLabel.css("color", color);
    }

    resetCounter() {
        this.filterId++;

        this.showingUsers = 0;
        this.updateLabels();
        this.changeLabelsColor(this.gray);
    }

    increaseMatch(filterId) {
        if(this.filterSessionExpired(filterId)) return;
        this.showingUsers++;
    }

    filterSessionExpired(filterId) {
        return filterId < this.filterId ? true : false;
    }
}

var header = {
    "id": {field: "id", caption: "ID", width: 60},
    "name": {field: "name", caption: "Name", width: "auto"},
    "gender": {field: "gender", caption: "Gender", width: 80},
    "age": {field: "age", caption: "Age", width: 50},
    "country": {field: "country", caption: "Country", width: 80, columnType: 'image', style: {imageSizing: 'keep-aspect-ratio'}},
    "email": {field: "email", caption: "Email", width: "auto"},
    "address": {field: "address", caption: "Address", width: "auto", style: {textOverflow: "ellipsis"}},
    "phone_number": {field: "phone_number", caption: "Phone number", width: 200},
    "quote": {field: "quote", caption: "Quote", width: "auto", style: {textOverflow: "ellipsis"}}
}

var counter = new Counter();

$(document).ready(function(){
    // initialize
    grid = new cheetahGrid.ListGrid({
        // Parent element on which to place the grid
        parentElement: document.querySelector("#users-grid"),
        // Header definition
        header: Object.values(header)
    });
    setupFilter();
    counter.setLabels();
});

function setupFilter() {
    // add filter event
    const filter = document.querySelector("#filter");
    filter.addEventListener('input', () => {
        counter.resetCounter();
        const filterValues = preprocessFilterValues(filter.value);
        filterDataSource.filter = !isFilterValuesEmpty(filterValues) ? (record) => {
            return filterByValues(filterValues, record);
        } : null;
        // Please call `invalidate()`
        grid.invalidate();
        setTimeout(() => {
            // setTimeout to make sure the previous filter was cancelled completely
            // reset again to make sure counter is reset before the next counting
            counter.resetCounter();
            if(isShowingFilterResult()) {
                // count in filtered records
                filterUntilLastRecord(getFilterRecord(), counter.filterId, filterValues, start = 0);
                // count in the rest
                filterUntilLastRecord(filterDataSource["_source"], counter.filterId, filterValues, start = getCursorIndex() + 1);
            }
            else {
                // count in all records
                filterUntilLastRecord(filterDataSource["_source"], counter.filterId, filterValues, start = 0);
            }
        });
    });
}

function isFilterValuesEmpty(filterValues) {
    for (const [fieldName, terms] of Object.entries(filterValues)) {
        if(terms.length != 0) return false;
    }
    return true;
}

function preprocessFilterValues(filterInput) {
    function isEqualTerm(term) {
        return term.indexOf("\"") != -1 ? true : false;
    }

    function appendTerm(filterValues, scope, term) {
        if(term == "") return;
        scope = scope == "" ? "all" : scope;
        if(scope != "all" && !header[scope]) return;

        if(isEqualTerm(term)) {
            term = term.replaceAll("\"", "");
            if(!filterValues["equal"][scope]) filterValues["equal"][scope] = [];
            filterValues["equal"][scope].push(term);
        }
        else {
            if(!filterValues["like"][scope]) filterValues["like"][scope] = [];
            filterValues["like"][scope].push(term);
        }
    }

    // filterInput: str         name:(jessica d) email:gmail.com gender:"Male"
    // output: dict             {"like": {"all": [], "name": ["jessica d"], "email": ["gmail.com"]}, "equal": {"all": [], "gender": ["Male"]}}
    filterInput = splitFilterInput(filter.value)
    const filterValues = {"like": {"all": []}, "equal": {"all": []}};
    for(let filterWord of filterInput) {
        filterWord = filterWord.replaceAll("(", "").replaceAll(")", "");
        filterFieldValue = filterWord.split(":");
        if(filterFieldValue.length == 1) {
            appendTerm(filterValues, "all", filterFieldValue[0]);
            continue;
        }
        appendTerm(filterValues, filterFieldValue[0], filterFieldValue[1]);
    }
    return filterValues;
}

function filterByValues(filterValues, record) {
    if(!filterByEqualTerms(filterValues["equal"], record)) return false;
    return filterByLikeTerms(filterValues["like"], record);
}

function filterByEqualTerms(filterValues, record) {
    for (const [fieldName, terms] of Object.entries(filterValues)) {
        // no-field-specific terms should be handle last to improve the performance
        if(fieldName == "all") continue;
        if(!terms.every(term => filterByEqualTerm(fieldName, term, record))) return false;
    }
    // handle no-field-specific terms
    return filterValues["all"].every(term => filterByEqualTerm("all", term, record));
}

function filterByEqualTerm(fieldName, term, record) {
    if(fieldName != "all") return isMatchEqualTerm(term, record[fieldName]);

    // handle no-field-specific terms
    for (const [fieldName, fieldValue] of Object.entries(record)) {
        if(isMatchEqualTerm(term, fieldValue)) return true;
    }
    return false;
}

function isMatchEqualTerm(term, fieldValue) {
    if(typeof fieldValue != "string") fieldValue = fieldValue.toString();
    return fieldValue == term ? true : false;
}

function filterByLikeTerms(filterValues, record) {
    for (const [fieldName, terms] of Object.entries(filterValues)) {
        // no-field-specific terms should be handle last to improve the performance
        if(fieldName == "all") continue;
        if(!terms.every(term => filterByLikeTerm(fieldName, term.toLowerCase(), record))) return false;
    }
    // handle no-field-specific terms
    return filterValues["all"].every(term => filterByLikeTerm("all", term.toLowerCase(), record));
}

function filterByLikeTerm(fieldName, term, record) {
    if(fieldName != "all") return isMatchLikeTerm(term, record[fieldName]);

    // handle no-field-specific terms
    for (const [fieldName, fieldValue] of Object.entries(record)) {
        if(isMatchLikeTerm(term, fieldValue)) return true;
    }
    return false;
}

function isMatchLikeTerm(term, fieldValue) {
    if(typeof fieldValue != "string") fieldValue = fieldValue.toString();
    return fieldValue.toLowerCase().indexOf(term) >= 0 ? true : false;
}

function filterUntilLastRecord(source, filterId, filterValues, start) {
    let i = start;
    for(; i < source.length; i++) {
        const record = source[i];
        if(counter.filterSessionExpired(filterId)) return;
        if(filterByValues(filterValues, record)) counter.increaseMatch(filterId, record);
        if(i % counter.countChunkSize == 100) {
            // avoid call setTimeout if start == 0
            setTimeout(() => filterUntilLastRecord(source, filterId, filterValues, i + 1));
            return;
        }
    }
    if(i == filterDataSource["_source"].length) counter.updateLabels();
}

function isShowingFilterResult() {
    return filterDataSource["_filterData"] ? true : false;
}

function getFilterRecord() {
    if(filterDataSource["_filterData"] == undefined) return filterDataSource["_source"];
    return filterDataSource["_filterData"]["_filterdList"];
}

function getCursorIndex() {
    if(!isShowingFilterResult()) return 0;
    return filterDataSource["_filterData"]["_dataSourceItr"]["_curIndex"];
}

function splitFilterInput(str) {
    // extract term inside double quotes, parentheses, fieldName:term, term. Assume that terms always inside two double quotes or parentheses if exist.
    // Eg: name:(jessica d) email:gmail.com gender:"Male"
    // => ["name:(jessica d)", "email:gmail.com", "gender:\"Male\""]
    const regexp = /((\S*?):?(["(].*?[")])?)+/g;
    matched = str.match(regexp);
    return matched ? matched.filter(word => word != "") : []
}

class CountryFlagProcessor {
    constructor() {
        this.baseUrl = "https://raw.githubusercontent.com/ducbet/cheetahGridDemo/master/flag_imgs/";
        this.flags_url = {}
    }

    setFlagImages(dataSource) {
        for(let user of dataSource) {
            let flag_url = this.flags_url[user["country"]];
            if(flag_url) {
                user["country"] = flag_url;
                continue;
            }
            flag_url = this.baseUrl + user["country"].replace(" ", "_") + ".png";
            this.flags_url[user["country"]] = flag_url;
            user["country"] = flag_url;
        }
    }
}

function fetchUsers() {
    fetch("https://raw.githubusercontent.com/ducbet/cheetahGridDemo/master/db.json")
    .then(res => res.json())
    .then((out) => {
        if(grid != null) {
            flagProcessor = new CountryFlagProcessor();
            flagProcessor.setFlagImages(out);
            filterDataSource = new cheetahGrid.data.FilterDataSource(new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray(out)));
            grid.dataSource = filterDataSource;

            // trigger filter
            const filter = document.querySelector("#filter");
            filter.dispatchEvent(new Event("input"));
        }
        counter.allUsers = out.length;
        counter.updateLabels();
        counter.allUsersLabel.css("color", counter.black);
    })
    .catch(err => { throw err });
}
