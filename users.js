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

var counter = new Counter();

$(document).ready(function(){
    // initialize
    grid = new cheetahGrid.ListGrid({
        // Parent element on which to place the grid
        parentElement: document.querySelector("#users-grid"),
        // Header definition
        header: [
            {field: "id", caption: "ID", width: 60},
            {field: "name", caption: "Name", width: "auto"},
            {field: "gender", caption: "Gender", width: 80},
            {field: "age", caption: "Age", width: 50},
            {field: "email", caption: "Email", width: "auto"},
            {field: "address", caption: "Address", width: "auto", style: {textOverflow: "ellipsis"}},
            {field: "phone_number", caption: "Phone number", width: 200},
            {field: "quote", caption: "Quote", width: "auto", style: {textOverflow: "ellipsis"}},
        ]
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
        filterDataSource.filter = filterValues.length != 0 ? (record) => {
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

function preprocessFilterValues(filterValues) {
    if(typeof filterValues == "string") filterValues = filterValues.split(" ");
    return filterValues.filter(filterValue => filterValue != "");
}

function filterByValues(filterValues, record) {
    return filterValues.every(filterValue => filterByValue(filterValue.toLowerCase(), record));
}

function filterByValue(filterValue, record) {
    for (const [fieldName, fieldValue] of Object.entries(record)) {
        if(isMatch(filterValue, fieldValue)) return true;
    }
    return false;
}

function isMatch(filterValue, fieldValue) {
    if(typeof fieldValue != "string") fieldValue = fieldValue.toString()
    return fieldValue.toLowerCase().indexOf(filterValue) >= 0 ? true : false;
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

function fetchUsers() {
    fetch("http://localhost:3000/users")
//    fetch("http://localhost:3000/users?_page=1&_limit=10")
    .then(res => res.json())
    .then((out) => {
        if(grid != null) {
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
