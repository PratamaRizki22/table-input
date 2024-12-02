let currentPage = 1;
const rowsPerPage = 5;
let data = [];
let filteredData = [];
let dataToDelete = null;
let dataToEdit = null;

const baseUrl = 'http://172.20.0.4:8000/penduduk/';

function renderTable() {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    currentData.forEach((item) => {
        const row = `<tr>
            <td class="px-4 py-2">${item.nik}</td>
            <td class="px-4 py-2">${item.nama}</td>
            <td class="px-4 py-2">${item.tempat_lahir}</td>
            <td class="px-4 py-2">${item.tanggal_lahir}</td>
            <td class="px-4 py-2">${item.jenis_kelamin}</td>
            <td class="px-4 py-2">${item.agama}</td>
            <td class="px-4 py-2">${item.pekerjaan}</td>
            <td class="px-4 py-2">${item.kewarganegaraan}</td>
            <td class="px-4 py-2 text-center">
                <button class="text-blue-600" onclick="editData(${item.nik})">Edit</button>
                <button class="text-red-600" onclick="showDeleteModal(${item.nik})">Delete</button>
            </td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    renderPagination();
}

// Fungsi untuk membuat pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('li');
        pageButton.classList.add('cursor-pointer', 'px-4', 'py-2', 'bg-gray-200', 'rounded-md');
        pageButton.textContent = i;

        if (i === currentPage) {
            pageButton.classList.add('bg-blue-600', 'text-white');
        }

        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });

        pagination.appendChild(pageButton);
    }
}

// Menampilkan modal konfirmasi hapus
function showDeleteModal(nik) {
    dataToDelete = nik;
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('hidden');
}

// Menutup modal konfirmasi hapus
function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    modal.classList.add('hidden');
}

async function deleteRow() {
    if (!dataToDelete) return;

    try {
        const response = await fetch(`${baseUrl}${dataToDelete}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Hapus data dari array data yang sudah ter-filter
            data = data.filter(item => item.nik !== dataToDelete);
            filteredData = [...data];
            
            // Hapus elemen baris yang ada di tabel berdasarkan NIK
            const rowToDelete = document.getElementById(dataToDelete);
            if (rowToDelete) {
                rowToDelete.remove(); // Menghapus elemen baris dari DOM
            }

            // Render ulang tabel jika diperlukan (misalnya setelah filter atau sort)
            renderTable();

            // Tutup modal delete dan tampilkan alert
            closeDeleteModal();
            alert('Data berhasil dihapus');
        } else {
            console.error('Failed to delete data');
            alert('Gagal menghapus data');
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        alert('Terjadi kesalahan saat menghapus data');
    }
}


// Menambahkan event listener ke tombol konfirmasi dan cancel
document.getElementById('delete-confirm').addEventListener('click', deleteRow);
document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);

// Menambahkan data baru
async function createRow() {
    const nik = document.getElementById('nik').value;
    const nama = document.getElementById('nama').value;
    const tempat_lahir = document.getElementById('tempat-lahir').value;
    const tanggal_lahir = document.getElementById('tanggal-lahir').value;
    const jenis_kelamin = document.getElementById('jenis-kelamin').value;
    const agama = document.getElementById('agama').value;
    const pekerjaan = document.getElementById('pekerjaan').value;
    const kewarganegaraan = document.getElementById('kewarganegaraan').value;

    if (!nik || !nama || !tempatLahir || !tanggalLahir || !jenisKelamin || !agama || !pekerjaan || !kewarganegaraan) {
        alert("Semua data harus diisi!");
        return;
    }


    if (nik.length !== 16) {
        alert("NIK harus terdiri dari 16 digit!");
        return;
    }

    const newData = {
        nik,
        nama,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        agama,
        pekerjaan,
        kewarganegaraan
    };

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData)
        });

        if (response.ok) {
            const dataResponse = await response.json();
            data.push(dataResponse);
            filteredData = [...data];
            renderTable();
            closeModal();
            alert('Data berhasil ditambahkan');
        } else {
            console.error('Failed to add data');
            alert('Gagal menambahkan data');
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        alert('Terjadi kesalahan saat menambahkan data');
    }

    // Reset input form setelah data disimpan
    document.getElementById("nik").value = "";
    document.getElementById("nama").value = "";
    document.getElementById("tempat-lahir").value = "";
    document.getElementById("tanggal-lahir").value = "";
    document.getElementById("jenis-kelamin").value = "Laki-laki";
    document.getElementById("agama").value = "Islam";
    document.getElementById("pekerjaan").value = "";
    document.getElementById("kewarganegaraan").value = "WNI";
    
    closeModal();
}

// mengedit data
async function editData(nik) {
    nik = nik.toString().trim(); // Mengkonversi ke string dan menghapus spasi ekstra

    dataToEdit = data.find(item => item.nik.toString().trim() === nik);

    if (dataToEdit) {
        console.log('Data yang akan diedit:', dataToEdit);  // Menampilkan data yang akan diedit

        document.getElementById('nik').value = dataToEdit.nik;
        document.getElementById('nama').value = dataToEdit.nama;
        document.getElementById('tempat-lahir').value = dataToEdit.tempat_lahir;
        document.getElementById('tanggal-lahir').value = dataToEdit.tanggal_lahir;
        document.getElementById('jenis-kelamin').value = dataToEdit.jenis_kelamin;
        document.getElementById('agama').value = dataToEdit.agama;
        document.getElementById('pekerjaan').value = dataToEdit.pekerjaan;
        document.getElementById('kewarganegaraan').value = dataToEdit.kewarganegaraan;

        // Menampilkan modal untuk mengedit data
        const modal = document.getElementById('add-modal');
        modal.classList.remove('hidden');

        // Ubah tombol "Save" untuk mengupdate data
        const saveButton = document.querySelector('#add-modal button:nth-child(2)');
        saveButton.textContent = "Update";
        saveButton.onclick = () => updateRow(nik); // Memanggil fungsi update ketika tombol ditekan
    } else {
        // Jika data tidak ditemukan, tampilkan pesan
            alert('Data dengan NIK', nik, 'tidak ditemukan.');

    }
}

async function updateRow(nik) {
    const nikVal = document.getElementById('nik').value;
    const nama = document.getElementById('nama').value;
    const tempat_lahir = document.getElementById('tempat-lahir').value;
    const tanggal_lahir = document.getElementById('tanggal-lahir').value;
    const jenis_kelamin = document.getElementById('jenis-kelamin').value;
    const agama = document.getElementById('agama').value;
    const pekerjaan = document.getElementById('pekerjaan').value;
    const kewarganegaraan = document.getElementById('kewarganegaraan').value;

    const updatedData = {
        nik: nikVal,
        nama,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        agama,
        pekerjaan,
        kewarganegaraan
    };

    try {
        const response = await fetch(`${baseUrl}${nik}/`, {
            method: 'PUT', // Menggunakan PUT untuk update data
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        if (response.ok) {
            const dataResponse = await response.json();
            // Memperbarui data di array setelah berhasil diubah
            data = data.map(item => item.nik === nik ? dataResponse : item);
            filteredData = [...data];
            renderTable();
            closeModal();
            alert('Data berhasil diperbarui');
        } else {
            console.error('Gagal memperbarui data');
            alert('Gagal memperbarui data');
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        alert('Terjadi kesalahan saat memperbarui data');
    }
}


function searchTable() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    filteredData = data.filter(item => {
        return (
            item.nik.toLowerCase().includes(searchInput) ||
            item.nama.toLowerCase().includes(searchInput) ||
            item.tempat_lahir.toLowerCase().includes(searchInput) ||
            item.tanggal_lahir.toLowerCase().includes(searchInput)
        );
    });
    currentPage = 1;
    renderTable();
}

// Menampilkan modal untuk menambahkan data
function showModal() {
    const modal = document.getElementById('add-modal');
    modal.classList.remove('hidden');
}

// Menutup modal
function closeModal() {
    const modal = document.getElementById('add-modal');
    modal.classList.add('hidden');
}

// Inisialisasi data ketika halaman dimuat
window.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(baseUrl);
    data = await response.json();
    filteredData = [...data];
    renderTable();
});