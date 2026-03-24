document.addEventListener('DOMContentLoaded', () => {
    const hoursInput = document.getElementById('hours-input');
    const minutesInput = document.getElementById('minutes-input');
    const addBtn = document.getElementById('add-btn');
    const recordList = document.getElementById('record-list');
    const emptyState = document.getElementById('empty-state');
    const totalCountText = document.getElementById('total-count');
    const totalHoursText = document.getElementById('total-hours');
    const clearBtn = document.getElementById('clear-btn');
    const exportBtn = document.getElementById('export-btn');

    let records = [];

    // 初始化讀取 LocalStorage (選配，這裡先實作記憶功能)
    const savedRecords = localStorage.getItem('time-records');
    if (savedRecords) {
        records = JSON.parse(savedRecords);
        renderTable();
    }

    addBtn.addEventListener('click', () => {
        const h = parseInt(hoursInput.value) || 0;
        const m = parseInt(minutesInput.value) || 0;

        if (h === 0 && m === 0) {
            alert('請至少輸入小時或分鐘！');
            return;
        }

        const id = Date.now();
        const rowTotal = h + (m / 60);

        records.push({ id, h, m, rowTotal });
        saveAndRender();

        // 清空輸入
        hoursInput.value = '';
        minutesInput.value = '';
        hoursInput.focus();
    });

    clearBtn.addEventListener('click', () => {
        if (records.length === 0) return;
        if (confirm('確定要清除所有記錄嗎？')) {
            records = [];
            saveAndRender();
        }
    });

    exportBtn.addEventListener('click', () => {
        if (records.length === 0) {
            alert('沒有資料可以匯出！');
            return;
        }

        const data = records.map((r, index) => ({
            '序號': index + 1,
            '小時': r.h,
            '分鐘': r.m,
            '小計 (小時)': parseFloat(r.rowTotal.toFixed(2))
        }));

        const totalH = records.reduce((sum, r) => sum + r.rowTotal, 0);
        data.push({
            '序號': '總計',
            '小時': '',
            '分鐘': '',
            '小計 (小時)': parseFloat(totalH.toFixed(2))
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "加班記錄");

        // 匯出檔案
        XLSX.writeFile(workbook, `加班記錄_${new Date().toISOString().slice(0, 10)}.xlsx`);
    });

    function deleteRecord(id) {
        records = records.filter(r => r.id !== id);
        saveAndRender();
    }

    window.deleteRecord = deleteRecord; // 讓 inline HTML 可以呼叫

    function saveAndRender() {
        localStorage.setItem('time-records', JSON.stringify(records));
        renderTable();
    }

    function renderTable() {
        recordList.innerHTML = '';
        
        if (records.length === 0) {
            emptyState.style.display = 'block';
            totalCountText.textContent = '0';
            totalHoursText.textContent = '0.00';
            return;
        }

        emptyState.style.display = 'none';
        let totalH = 0;

        records.forEach((record) => {
            const tr = document.createElement('tr');
            tr.className = 'record-row';
            tr.innerHTML = `
                <td>${record.h} h</td>
                <td>${record.m} m</td>
                <td>${record.rowTotal.toFixed(2)} 小時</td>
                <td>
                    <button class="delete-btn" onclick="deleteRecord(${record.id})">刪除</button>
                </td>
            `;
            recordList.appendChild(tr);
            totalH += record.rowTotal;
        });

        totalCountText.textContent = records.length;
        totalHoursText.textContent = totalH.toFixed(2);
    }
});
