function filterTable() {
  let startDate = Date.parse(document.getElementById("start-date").value);
  let endDate = Date.parse(document.getElementById("end-date").value);
  let table = document.getElementById("table-closest-approaches");
  let tableRows = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tableRows.length; i++) {
    let dateColumn = tableRows[i].getElementsByTagName("td")[0];
    if (dateColumn) {
      let date = Date.parse(dateColumn.innerText);
      if (date >= startDate && date <= endDate) {
        tableRows[i].style.display = "";
      } else {
        tableRows[i].style.display = "none";
      }
    }
  }
}

function toggleStartDateFilter() {
  if (!document.getElementById('checkbox-start-date').checked) {
    document.getElementById('start-date').setAttribute('disabled', 'true');
  } else {
    document.getElementById('start-date').removeAttribute('disabled');
  }
}

function toggleEndDateFilter() {
  if (!document.getElementById('checkbox-end-date').checked) {
    document.getElementById('end-date').setAttribute('disabled', 'true');
  } else {
    document.getElementById('end-date').removeAttribute('disabled');
  }
}