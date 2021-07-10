class Counter {
    constructor() {
        this.countChunkSize = 1000;
        this.filterId = 0;

        // for countries flag
        this.baseUrl = "https://raw.githubusercontent.com/ducbet/cheetahGridDemo/master/flag_imgs/";
        // {"Vietnam": "https://raw.githubusercontent.com/ducbet/cheetahGridDemo/master/flag_imgs/Vietnam.png"}
        this.flags_url = {};
        // {"https://raw.githubusercontent.com/ducbet/cheetahGridDemo/master/flag_imgs/Vietnam.png": "Vietnam"}
        this.flags_url_inverted = {};
        // {"Vietnam": jquery label}
        this.countries_label = {}

        this.allUsers = 0;
        this.showingUsers = 0;
        this.showingMale = 0;
        this.showingFemale = 0;
        this.showingCountry = {};

        this.black = "#000";
        this.gray = "#D3D3D3";
    }

    setLabels() {
        this.allUsersLabel = $("#count-user");
        this.showingUsersLabel = $("#count-showing");
        this.showingMaleLabel = $("#count-male");
        this.showingFemaleLabel = $("#count-female");
    }

    updateLabels() {
        this.allUsersLabel.text(this.allUsers);
        this.showingUsersLabel.text(this.showingUsers);
        this.showingMaleLabel.text(this.showingMale);
        this.showingFemaleLabel.text(this.showingFemale);
        for (var country of this.getCountries()) {
            this.countries_label[country].text(this.showingCountry[country]);
        }
        this.countries_label[country]

        this.changeLabelsColor(this.black);
    }

    changeLabelsColor(color) {
        this.showingUsersLabel.css("color", color);
        this.showingMaleLabel.css("color", color);
        this.showingFemaleLabel.css("color", color);
        for (var country of this.getCountries()) {
            this.countries_label[country].css("color", color);
        }
    }

    resetCounter() {
        this.filterId++;

        this.showingUsers = 0;
        this.showingMale = 0;
        this.showingFemale = 0;
        for (var country of this.getCountries()) {
            this.showingCountry[country] = 0;
        }

        this.updateLabels();
        this.changeLabelsColor(this.gray);
    }

    increaseMatch(filterId, record) {
        if(this.filterSessionExpired(filterId)) return;
        this.showingUsers++;
        if(record["gender"] == "Male") this.showingMale++;
        else this.showingFemale++;
        this.showingCountry[this.getCountryName(record["country"])] += 1;
    }

    filterSessionExpired(filterId) {
        return filterId < this.filterId ? true : false;
    }

    // countries flag
    setFlagImages(dataSource) {
        for(let user of dataSource) {
            user["country"] = this.getCountryImgUrl(user["country"])
        }
    }

    addCountryLogos() {
        var countries = this.getCountries();
        for(var country of countries) {
            this.addCountryLogo(country);
        }
    }

    addCountryLogo(country) {
        var count_container = $("#grid-record-count-container");
        count_container.append(this.createCountryIcon(country));
        count_container.append(this.createCountryCountLabel(country));
    }

    createCountryIcon(country) {
        var countryImgTag = $("<img></img>");
        countryImgTag.attr("src", this.getCountryImgUrl(country));
        countryImgTag.attr("id", this.standardizeCountryName(country) + "-img");
        countryImgTag.addClass("count-icon filterable-icon");
        countryImgTag.dblclick(() => {
            appendAndTriggerFilterWithNewValue(" country:\"" + country + "\" ");
        })
        return countryImgTag;
    }

    createCountryCountLabel(country) {
        var countryCountLabel = $("<label>0</label>");
        countryCountLabel.attr("id", "count-" + this.standardizeCountryName(country));
        countryCountLabel.addClass("count-label");
        this.countries_label[country] = countryCountLabel;
        return countryCountLabel;
    }

    getCountryImgUrl(country) {
        if(this.flags_url[country] == undefined) this.addCountry(country);
        return this.flags_url[country];
    }

    addCountry(country) {
        var imgUrl = this.baseUrl + this.getCountryImgName(country)
        this.flags_url[country] = imgUrl;
        this.flags_url_inverted[imgUrl] = country;
        this.showingCountry[country] = 0;
    }

    getCountryImgName(country) {
        return this.standardizeCountryName(country) + ".png";
    }

    getCountryName(countryImgUrl) {
        // get country name from country img url
        return this.flags_url_inverted[countryImgUrl];
    }

    standardizeCountryName(country) {
        return country.replace(" ", "_");
    }

    getCountries() {
        return Object.keys(this.flags_url);
    }
}

var header = {
    "id": {
        field: "id", caption: "ID", width: 60,
    },
    "name": {
        field: "name", caption: "Name", width: "auto",
        // custom properties
        "filterable": true
    },
    "gender": {
        field: "gender", caption: "Gender", width: 80,
        // custom properties
        "filterable": true
    },
    "age": {
        field: "age", caption: "Age", width: 50,
        // custom properties
        "filterable": true
    },
    "country": {
        field: "country", caption: "Country", width: 80, columnType: 'image', style: {imageSizing: 'keep-aspect-ratio'},
        // custom properties
        "filterable": true, "icon_search": true
    },
    "email": {
        field: "email", caption: "Email", width: "auto",
        // custom properties
        "filterable": true
    },
    "address": {
        field: "address", caption: "Address", width: "auto", style: {textOverflow: "ellipsis"},
        // custom properties
        "filterable": true
    },
    "phone_number": {
        field: "phone_number", caption: "Phone number", width: 200,
        // custom properties
        "filterable": true
    },
    "quote": {
        field: "quote", caption: "Quote", width: "auto", style: {textOverflow: "ellipsis"},
        // custom properties
        "filterable": true
    }
}

const {
  CLICK_CELL,
  DBLCLICK_CELL,
  DBLTAP_CELL,
  MOUSEDOWN_CELL,
  MOUSEUP_CELL,
  SELECTED_CELL,
  KEYDOWN,
  MOUSEMOVE_CELL,
  MOUSEENTER_CELL,
  MOUSELEAVE_CELL,
  MOUSEOVER_CELL,
  MOUSEOUT_CELL,
  INPUT_CELL,
  PASTE_CELL,
  RESIZE_COLUMN,
  SCROLL,
  CHANGED_VALUE,
} = cheetahGrid.ListGrid.EVENT_TYPE;

fetchUsers();

var grid = null;
var filterDataSource = new cheetahGrid.data.FilterDataSource(new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray([])));

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
    grid.listen(DBLCLICK_CELL, (...args) => addCellDbClickEvent(args));
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
    for (const [scope, terms] of Object.entries(filterValues)) {
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
    for (const [scope, terms] of Object.entries(filterValues)) {
        // no-field-specific terms should be handle last to improve the performance
        if(scope == "all") continue;
        if(!terms.every(term => filterByEqualTerm(scope, term, record))) return false;
    }
    // handle no-field-specific terms
    return filterValues["all"].every(term => filterByEqualTerm("all", term, record));
}

function filterByEqualTerm(scope, term, record) {
    if(scope != "all" && header[scope]["filterable"] == true) return isMatchEqualTerm(term, record[scope], header[scope]["icon_search"]);

    // handle no-field-specific terms
    for (const [fieldName, fieldValue] of Object.entries(record)) {
        if(header[fieldName]["filterable"] != true) continue;
        if(isMatchEqualTerm(term, fieldValue, header[fieldName]["icon_search"])) return true;
    }
    return false;
}

function isMatchEqualTerm(term, fieldValue, iconSearch) {
    if(typeof fieldValue != "string") fieldValue = fieldValue.toString();
    if(iconSearch) {
        iconImgName = counter.getCountryImgName(term);
        return fieldValue.endsWith(iconImgName);
    }
    return fieldValue == term ? true : false;
}

function filterByLikeTerms(filterValues, record) {
    for (const [scope, terms] of Object.entries(filterValues)) {
        // no-field-specific terms should be handle last to improve the performance
        if(scope == "all") continue;
        if(!terms.every(term => filterByLikeTerm(scope, term.toLowerCase(), record))) return false;
    }
    // handle no-field-specific terms
    return filterValues["all"].every(term => filterByLikeTerm("all", term.toLowerCase(), record));
}

function filterByLikeTerm(scope, term, record) {
    if(scope != "all" && header[scope]["filterable"] == true) return isMatchLikeTerm(term, record[scope], header[scope]["icon_search"]);

    // handle no-field-specific terms
    for (const [fieldName, fieldValue] of Object.entries(record)) {
        if(header[fieldName]["filterable"] != true) continue;
        if(isMatchLikeTerm(term, fieldValue, header[fieldName]["icon_search"])) return true;
    }
    return false;
}

function isMatchLikeTerm(term, fieldValue, iconSearch) {
    if(typeof fieldValue != "string") fieldValue = fieldValue.toString();
    if(iconSearch) {
        iconImgName = counter.getCountryImgName(term);
        return fieldValue.endsWith(iconImgName);
    }
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

function addCellDbClickEvent(args) {
    row = args[0]["row"];
    // ignore header
    if(row == 0) return;
    row -= 1;
    col = args[0]["col"];
    fieldName = grid.header[col]["field"];
    cellValue = getClickedRow(row)[fieldName];

    iconSearch = grid.header[col]["icon_search"] ? true: false;
    if(iconSearch) {
        appendAndTriggerFilterWithNewValue(" " + fieldName + ":" + "\"" + counter.getCountryName(cellValue) + "\"");
    }
    else {
        appendAndTriggerFilterWithNewValue(" " + fieldName + ":" + "\"" + cellValue + "\"");
    }
}

function getClickedRow(row) {
    if(isShowingFilterResult()) return getFilterRecord()[row];
    return row;
}

function appendAndTriggerFilterWithNewValue(appendInput) {
    const filter = document.querySelector("#filter");
    filter.value += appendInput;
    triggerFilter(filter);
}

function triggerFilter(filter=null) {
    if(filter == null) filter = document.querySelector("#filter");
    filter.dispatchEvent(new Event("input"));
}

function fetchUsers() {
    fetch("https://raw.githubusercontent.com/ducbet/cheetahGridDemo/master/db.json")
    .then(res => res.json())
    .then((out) => {
        if(grid != null) {
            counter.setFlagImages(out);
            counter.addCountryLogos();
            filterDataSource = new cheetahGrid.data.FilterDataSource(new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray(out)));
            grid.dataSource = filterDataSource;

            triggerFilter();
        }
        counter.allUsers = out.length;
        counter.updateLabels();
        counter.allUsersLabel.css("color", counter.black);
    })
    .catch(err => { throw err });
}
