fetchUsers();

var grid = null;
var filterDataSource = null;

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
});

function setupFilter() {
    // add filter event
    const filter = document.querySelector("#filter");
    filter.addEventListener('input', () => {
        const filterValue = filter.value;
        filterDataSource.filter = filterValue ? (record) => {
            // filtering method
            for (const k in record) {
                if ((`${record[k]}`).indexOf(filterValue) >= 0) {
                    return true;
                }
            }
            return false;
        } : null;
        // Please call `invalidate()`
        grid.invalidate();
    });
}

function fetchUsers() {
    fetch("http://localhost:3000/users")
//    fetch("http://localhost:3000/users?_page=1&_limit=10")
    .then(res => res.json())
    .then((out) => {
        if(grid != null) {
            filterDataSource = new cheetahGrid.data.FilterDataSource(new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray(out)));
            grid.dataSource = filterDataSource;
        }
    })
    .catch(err => { throw err });
}
