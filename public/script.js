async function compareFiles() {
    const formData = new FormData(document.getElementById('uploadForm'));
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    populateTable(data.comparisonResults);
}



function populateTable(results) {
    const tableBody = document.getElementById('comparisonTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    results.forEach((result, index) => {
        const row = tableBody.insertRow();

        // File 1 column
        const cell1 = row.insertCell();
        cell1.textContent = result.file1 ? result.file1.content : '';

        // Checkbox for File 1
        const cellCheckbox1 = row.insertCell();
        const checkbox1 = document.createElement('input');
        checkbox1.type = 'checkbox';
        checkbox1.name = 'file1';
        checkbox1.value = index;
        checkbox1.checked = !!result.file1;
        if (!result.file1) checkbox1.style.display = 'none'; // Hide if no entry for file1
        cellCheckbox1.appendChild(checkbox1);

        // Checkbox for File 2
        const cellCheckbox2 = row.insertCell();
        const checkbox2 = document.createElement('input');
        checkbox2.type = 'checkbox';
        checkbox2.name = 'file2';
        checkbox2.value = index;
        checkbox2.checked = !!result.file2 && !result.file1;
        if (!result.file2) checkbox2.style.display = 'none'; // Hide if no entry for file2
        cellCheckbox2.style.textAlign = 'right'; // Align to the right
        cellCheckbox2.appendChild(checkbox2);

        // File 2 column
        const cell2 = row.insertCell();
        cell2.textContent = result.file2 ? result.file2.content : '';
    });
}

