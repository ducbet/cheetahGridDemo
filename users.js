class Counter {
    constructor() {
        this.countChunkSize = 1000;
        this.filterId = 0;
        this.visibleAgeNum = 3;

        // for countries flag
        this.baseUrl = "https://raw.githubusercontent.com/ducbet/cheetahGridDemo/master/flag_imgs/";
        // {"https://raw.githubusercontent.com/ducbet/cheetahGridDemo/master/flag_imgs/Viet_Nam.png": "Viet_Nam"}
        this.flagsUrlInverted = {};

        this.allUsers = 0;
        this.showingUsers = 0;
        this.showingMale = 0;
        this.showingFemale = 0;
        /*
        {"26": {
                "showing": 0,
                "jqueryLabel": jquery label,
                "container": jquery container
            }
        }
        */
        this.ages = {}
        /*
        {"Viet_Nam": {
                "showing": 0,
                "flagsUrl": "https://raw.githubusercontent.com/ducbet/cheetahGridDemo/master/flag_imgs/Viet_Nam.png"},
                "jqueryLabel": jquery label
            }
        }
        */
        this.countries = {};

        this.black = "#000";
        this.gray = "#D3D3D3";
    }

    setLabels() {
        this.allUsersLabel = $("#count-user");
        this.showingUsersLabel = $("#count-showing");
        this.showingMaleLabel = $("#count-male");
        this.showingFemaleLabel = $("#count-female");
    }

    updateLabels(done=false) {
        this.allUsersLabel.text(this.allUsers);
        this.showingUsersLabel.text(this.showingUsers);
        this.showingMaleLabel.text(this.showingMale);
        this.showingFemaleLabel.text(this.showingFemale);
        for (var age of this.getAges()) {
            this.ages[age]["jqueryLabel"].text(this.ages[age]["showing"]);
        }
        for (var country of this.getCountries()) {
            this.countries[country]["jqueryLabel"].text(this.countries[country]["showing"]);
        }
        this.displayTopAges();
        if(done) this.changeLabelsColor(this.black);
    }

    changeLabelsColor(color) {
        this.showingUsersLabel.css("color", color);
        this.showingMaleLabel.css("color", color);
        this.showingFemaleLabel.css("color", color);
        for (var age of this.getAges()) {
            this.ages[age]["jqueryLabel"].css("color", color);
        }
        for (var country of this.getCountries()) {
            this.countries[country]["jqueryLabel"].css("color", color);
        }
    }

    resetCounter() {
        this.filterId++;

        this.showingUsers = 0;
        this.showingMale = 0;
        this.showingFemale = 0;
        for (var age of this.getAges()) {
            this.ages[age]["showing"] = 0;
        }
        for (var country of this.getCountries()) {
            this.countries[country]["showing"] = 0;
        }

        this.updateLabels(true);
        this.changeLabelsColor(this.gray);
    }

    increaseMatch(filterId, record) {
        if(this.filterSessionExpired(filterId)) return;
        this.showingUsers++;
        if(record["gender"] == "Male") this.showingMale++;
        else this.showingFemale++;
        this.ages[[record["age"]]]["showing"]++;
        this.countries[this.getCountryName(record["country"])]["showing"] += 1;
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
            appendAndTriggerFilterWithNewValue(" \"" + country + "\":country ");
        });
        return countryImgTag;
    }

    createCountryCountLabel(country) {
        var countryCountLabel = $("<label>0</label>");
        countryCountLabel.attr("id", "count-" + this.standardizeCountryName(country));
        countryCountLabel.addClass("count-label");
        this.countries[country]["jqueryLabel"] = countryCountLabel;
        return countryCountLabel;
    }

    getCountryImgUrl(country) {
        if(this.countries[country] == undefined) this.addCountry(country);
        return this.countries[country]["flagUrl"];
    }

    addCountry(country) {
        var imgUrl = this.baseUrl + this.getCountryImgName(country)
        var newCountry = {
            "showing": 0,
            "flagUrl": imgUrl
        }
        this.flagsUrlInverted[imgUrl] = country;
        this.countries[country] = newCountry;
    }

    getCountryImgName(country) {
        return this.standardizeCountryName(country) + ".png";
    }

    getCountryName(countryImgUrl) {
        // get country name from country img url
        return this.flagsUrlInverted[countryImgUrl];
    }

    standardizeCountryName(country) {
        return country.replace(" ", "_");
    }

    getCountries() {
        return Object.keys(this.countries);
    }

    addAgeCount(dataSource) {
        var count_container = $("#grid-record-count-container");
        for(let user of dataSource) {
            let age = user["age"].toString();
            user["age"] = age;
            if(age in this.ages) continue;

            this.ages[age] = {"showing": 0};
            this.ages[age]["container"] = this.createAgeContainer(age);
            count_container.append(this.ages[age]["container"]);
        }
    }

    createAgeContainer(age) {
        var ageContainer = $("<div></div>");
        ageContainer.addClass("display-none");
        ageContainer.append(this.createAgeLabel(age));
        ageContainer.append(this.createAgeIcon(age));
        ageContainer.append(this.createAgeCountLabel(age));
        return ageContainer;
    }

    createAgeLabel(age){
        return $("<label>" + age + " </label>");
    }

    createAgeIcon(age){
        var birthdayIcon = $("<i></i>");
        birthdayIcon.attr("id", "age-img-" + age);
        birthdayIcon.addClass("fa fa-birthday-cake count-icon filterable-icon");
        birthdayIcon.dblclick(() => {
            appendAndTriggerFilterWithNewValue(" \"" + age + "\":age ");
        });
        return birthdayIcon;
    }

    createAgeCountLabel(age){
        var ageCountLabel = $("<label>0</label>");
        ageCountLabel.attr("id", "count-age-" + age);
        ageCountLabel.addClass("count-label");
        this.ages[age]["jqueryLabel"] = ageCountLabel;
        return ageCountLabel;
    }

    getAges() {
        return Object.keys(this.ages);
    }

    displayTopAges() {
        // Sort the array based on the showing count
        var sorted = Object.entries(this.ages).sort(function(first, second) {
            return second[1]["showing"] - first[1]["showing"];
        });
        for(var [index, ages] of Object.entries(sorted)) {
            var age = ages[0];
            var ageContainer = this.ages[age]["container"];
            if(index >= this.visibleAgeNum) {
                ageContainer.addClass("display-none");
                continue;
            }
            ageContainer.removeClass("display-none");
        }
    }
}

var header = {
    "id": {
        field: "id", caption: "ID", width: 70,
        headerType: 'sort', headerAction: 'sort', headerStyle: {sortArrowColor: 'red'},
    },
    "name": {
        field: "name", caption: "Name", width: 230,
        headerType: 'sort', headerAction: 'sort', headerStyle: {sortArrowColor: 'red'},
        // custom properties
        "clickable": true, "filterable": true,
    },
    "gender": {
        field: "gender", caption: "Gender", width: 90,
        headerType: 'sort', headerAction: 'sort', headerStyle: {sortArrowColor: 'red'},
        // custom properties
        "clickable": true, "filterable": true,
    },
    "age": {
        field: "age", caption: "Age", width: 60,
        headerType: 'sort', headerAction: 'sort', headerStyle: {sortArrowColor: 'red'},
        // custom properties
        "clickable": true, "filterable": true,
    },
    "country": {
        field: "country", caption: "Country", width: 90, columnType: 'image', style: {imageSizing: 'keep-aspect-ratio'},
        headerType: 'sort', headerAction: 'sort', headerStyle: {sortArrowColor: 'red'},
        // custom properties
        "clickable": true, "filterable": true, "icon_search": true,
    },
    "email": {
        field: "email", caption: "Email", width: 300,
        headerType: 'sort', headerAction: 'sort', headerStyle: {sortArrowColor: 'red'},
        // custom properties
        "clickable": true, "filterable": true,
    },
    "address": {
        field: "address", caption: "Address", width: "auto", style: {textOverflow: "ellipsis"},
        headerType: 'sort', headerAction: 'sort', headerStyle: {sortArrowColor: 'red'},
        // custom properties
        "clickable": true, "filterable": true,
    },
    "phone_number": {
        field: "phone_number", caption: "Phone number", width: 210,
        headerType: 'sort', headerAction: 'sort', headerStyle: {sortArrowColor: 'red'},
        // custom properties
        "clickable": true, "filterable": true,
    },
    "quote": {
        field: "quote", caption: "Quote", width: "auto", style: {textOverflow: "ellipsis"},
        headerType: 'sort', headerAction: 'sort', headerStyle: {sortArrowColor: 'red'},
        // custom properties
        "clickable": true, "filterable": true,
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
    addDblClickEvents();
    addHoverEvents();
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
            // count in all records
            filterUntilLastRecord(filterDataSource["_source"], counter.filterId, filterValues, start = 0);
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

    // filterInput: str         (jessica d):name gmail.com:email "Male":gender
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
        appendTerm(filterValues, filterFieldValue[1], filterFieldValue[0]);
    }
    return optimizeEqualFilterValues(filterValues);
}

function optimizeEqualFilterValues(filterValues) {
    for(const scope of Object.keys(filterValues["equal"])) {
        if(scope == "all") continue;
        terms = filterValues["equal"][scope]
        if(terms == undefined || terms.length <= 1) continue;
        // max terms.length is 2
        // only accept the last equal term (1)
        filterValues["equal"][scope] = [terms[1]];
        // replace filter value (but not trigger input event)
        const filter = document.querySelector("#filter");
        // remove the term number 0
        filter.value = filter.value.replace("\"" + terms[0] + "\":" + scope + " ", "").replace("  ", " ");
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
            counter.updateLabels();
            return;
        }
    }
    if(i == filterDataSource["_source"].length) counter.updateLabels(done=true);
}

function isShowingFilterResult() {
    return filterDataSource["_filterData"] ? true : false;
}

function isGridSorted() {
    return filterDataSource["_dataSource"]["_sortedIndexMap"] != undefined ? true : false;
}

function getFilterRecord() {
    if(filterDataSource["_filterData"] == undefined) return filterDataSource["_source"];
    return filterDataSource["_filterData"]["_filterdList"];
}

function getCursorIndex() {
    if(!isShowingFilterResult()) return 0;
    return filterDataSource["_filterData"]["_dataSourceItr"]["_curIndex"];
}

function getSortedIndexMap() {
    return filterDataSource["_dataSource"]["_sortedIndexMap"];
}

function splitFilterInput(str) {
    // extract term inside double quotes, parentheses, fieldName:term, term. Assume that terms always inside two double quotes or parentheses if exist.
    // Eg: (jessica d):name gmail.com:email "Male":gender
    // => ["name:(jessica d)", "email:gmail.com", "gender:\"Male\""]
    const regexp = /((["(].*?[")])?:?(\S*?))+/g;
    matched = str.match(regexp);
    return matched ? matched.filter(word => word != "") : []
}

function addDblClickEvents() {
    grid.listen(DBLCLICK_CELL, (...args) => addCellDbClickEvent(args));
    $("#male-img").dblclick(() => {
        appendAndTriggerFilterWithNewValue(" \"Male\":gender ");
    });
    $("#female-img").dblclick(() => {
        appendAndTriggerFilterWithNewValue(" \"Female\":gender ");
    });
    $("#user-img").dblclick(() => {
        const filter = document.querySelector("#filter");
        filter.value = "";
        triggerFilter(filter);
    });
}

function addHoverEvents() {
    grid.listen(MOUSEENTER_CELL, (...args) => {
        if(isOnClickableColumn(args[0]["col"])) {
            document.body.style.cursor = "pointer";
        }
    });
    grid.listen(MOUSELEAVE_CELL, (...args) => {
        if(isOnClickableColumn(args[0]["col"])) {
            document.body.style.cursor = "default";
        }
    });
}

function addCellDbClickEvent(args) {
    row = args[0]["row"];
    // ignore header
    if(row == 0) return;
    row -= 1;
    col = args[0]["col"];
    if(!isOnClickableColumn(col)) return;

    fieldName = grid.header[col]["field"];
    cellValue = getClickedRow(row)[fieldName];

    iconSearch = grid.header[col]["icon_search"] ? true: false;
    if(iconSearch) {
        appendAndTriggerFilterWithNewValue(" \"" + counter.getCountryName(cellValue) + "\":" + fieldName + " ");
    }
    else {
        appendAndTriggerFilterWithNewValue(" \"" + cellValue + "\":" + fieldName + " ");
    }
}

function getClickedRow(row) {
    if(isGridSorted()) return getSortedIndexMap()[row];
    return getFilterRecord()[row];
}

function isOnClickableColumn(col) {
    columnName = grid.header[col]["field"];
    return header[columnName]["clickable"];
}

function appendAndTriggerFilterWithNewValue(appendInput) {
    const filter = document.querySelector("#filter");
    filter.value += appendInput;
    filter.value = filter.value.replace("  ", " ");
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
            counter.addAgeCount(out);
            filterDataSource = new cheetahGrid.data.FilterDataSource(new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray(out)));
            grid.dataSource = filterDataSource;

            triggerFilter();
        }
        counter.allUsers = out.length;
        counter.updateLabels(done=true);
        counter.allUsersLabel.css("color", counter.black);
    })
    .catch(err => { throw err });
}

// jquery ui autocomplete
$( function() {
    var availableTags = [
      ":name",
      ":gender",
      ":age",
      ":country",
      ":email",
      ":address",
      ":phone_number",
      ":quote",
    ];
    function split(filterInput) {
      return filterInput.split(" ").filter(word => word != "");
    }
    function sliceFromColon(lastTerm) {
        colonIndex = lastTerm.lastIndexOf(":");
        if(colonIndex != -1) return lastTerm.slice(colonIndex, lastTerm.length);
        return lastTerm;
    }
    function extractLast(filterInput) {
        lastTerm = split(filterInput).pop();
        return sliceFromColon(lastTerm);
    }
    minLengthWithoutColon = 3;

    $( "#filter" )
      // don't navigate away from the field on tab when selecting an item
      .on( "keydown", function( event ) {
        if ( event.keyCode === $.ui.keyCode.TAB &&
            $( this ).autocomplete( "instance" ).menu.active ) {
          event.preventDefault();
        }
      })
      .autocomplete({
        minLength: 1,
        delay: 0,
        autoFocus: true,
        source: function( request, response ) {
          // delegate back to autocomplete, but extract the last term
          response( $.ui.autocomplete.filter(
            availableTags, extractLast( request.term ) ) );
        },
        focus: function() {
          // prevent value inserted on focus
          return false;
        },
        select: function( event, ui ) {
          var terms = split( this.value );
          // remove the current input
          lastTerm = terms.pop();
          if(lastTerm.lastIndexOf(":") != -1) {
            // replace :the-first-char-of-fieldname with :fieldname. E.g:   :a -> :age
            terms.push( lastTerm.replace(sliceFromColon(lastTerm), ui.item.value));
          }
          else {
            // add the selected item
            terms.push( ui.item.value );
          }
          // add placeholder to get space at the end
          terms.push( "" );
          this.value = terms.join(" ");

          triggerFilter();
          return false;
        },
        search: function( event, ui ) {
            lastTerm = extractLast(this.value)
            if(availableTags.indexOf(lastTerm) != -1) event.preventDefault();
            if(lastTerm.lastIndexOf(":") != -1) return true;
            if(lastTerm.length < minLengthWithoutColon) event.preventDefault();
        }
      });
  } );
