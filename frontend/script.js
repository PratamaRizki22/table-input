let currentPage = 1;
const rowsPerPage = 8;
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
                <button type="button" class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" onclick="editData('${item.nik}')">Edit</button>
                <button type="button" class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" onclick="showDeleteModal('${item.nik}')">Delete</button>
            </td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage); 
    const paginationContainer = document.getElementById('pagination-buttons');
    paginationContainer.innerHTML = ''; 

    const prevBtn = document.getElementById('prevBtn');
    prevBtn.classList.toggle('disabled', currentPage === 1);
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

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

        paginationContainer.appendChild(pageButton);
    }

    const nextBtn = document.getElementById('nextBtn');
    nextBtn.classList.toggle('disabled', currentPage === totalPages);
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
}

function showDeleteModal(nik) {
    dataToDelete = nik;
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('hidden');
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    modal.classList.add('hidden');
    resetForm()

}

async function deleteRow() {
    if (!dataToDelete) return;
    console.log("dataTodelete: ", dataToDelete)
    try {
        const response = await fetch(`${baseUrl}${dataToDelete}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            data = data.filter(item => item.nik !== dataToDelete);
            filteredData = [...data];
            
            const rowToDelete = document.getElementById(dataToDelete);
            console.log('Searching for row with ID:', `nik-${dataToDelete}`);
            if (rowToDelete) {
                console.log('Deleting row:', rowToDelete); 
                rowToDelete.remove(); 
            }
            renderTable();
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

document.getElementById('delete-confirm').addEventListener('click', deleteRow);
document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);

async function createRow() {
    const nik = document.getElementById('nik').value;
    const nama = document.getElementById('nama').value;
    const tempat_lahir = document.getElementById('tempat-lahir').value;
    const tanggal_lahir = document.getElementById('tanggal-lahir').value;
    const jenis_kelamin = document.getElementById('jenis-kelamin').value;
    const agama = document.getElementById('agama').value;
    const pekerjaan = document.getElementById('pekerjaan').value;
    const kewarganegaraan = document.getElementById('kewarganegaraan').value;

    const finalStep = document.querySelector('.step:not(.hidden)');
    if (!validateStep(finalStep)) {
        return; 
    }

    if (nik.length !== 16) {
        alert("NIK harus terdiri dari 16 digit!");
        return;
    }

    const isNikUnique = await checkNikUniqueness(nik);
    if (!isNikUnique) {
        const shouldChangeNik = confirm("NIK sudah terdaftar, silakan ubah NIK atau batal input data.");
        if (shouldChangeNik) {
            return;
        } else {
            resetForm();
            closeModal(); 
            alert("Input data dibatalkan.");
            return; 
        }
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

    // Kirim data ke server jika NIK unik
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

    resetForm();
    closeModal();
}

async function editData(nik) {
    nik = nik.toString().trim();

    const dataToEdit = data.find(item => item.nik.toString().trim() === nik);

    if (dataToEdit) {
        console.log('Data yang akan diedit:', dataToEdit);

        document.getElementById('edit-nik').value = dataToEdit.nik;
        document.getElementById('edit-nama').value = dataToEdit.nama;
        document.getElementById('edit-tempat-lahir').value = dataToEdit.tempat_lahir;
        document.getElementById('edit-tanggal-lahir').value = dataToEdit.tanggal_lahir;
        document.getElementById('edit-jenis-kelamin').value = dataToEdit.jenis_kelamin;
        document.getElementById('edit-agama').value = dataToEdit.agama;
        document.getElementById('edit-pekerjaan').value = dataToEdit.pekerjaan;
        document.getElementById('edit-kewarganegaraan').value = dataToEdit.kewarganegaraan;

        // Menampilkan modal untuk mengedit data
        const modal = document.getElementById('edit-modal');
        modal.classList.remove('hidden');

        // Mengubah tombol "Save" menjadi "Update"
        const saveButton = document.querySelector('#edit-modal button:nth-child(2)');
        saveButton.textContent = "Update";

        // Menyimpan NIK pada tombol agar bisa digunakan saat update
        saveButton.onclick = () => updateRow(dataToEdit.nik); // Memanggil fungsi update ketika tombol ditekan
    } else {
        // Jika data tidak ditemukan, tampilkan pesan
        alert(`Data dengan NIK ${nik} tidak ditemukan.`);
    }
}

async function updateRow(nik) {
    // Mengambil nilai dari form modal
    const nikVal = document.getElementById('edit-nik').value;
    const nama = document.getElementById('edit-nama').value;
    const tempat_lahir = document.getElementById('edit-tempat-lahir').value;
    const tanggal_lahir = document.getElementById('edit-tanggal-lahir').value;
    const jenis_kelamin = document.getElementById('edit-jenis-kelamin').value;
    const agama = document.getElementById('edit-agama').value;
    const pekerjaan = document.getElementById('edit-pekerjaan').value;
    const kewarganegaraan = document.getElementById('edit-kewarganegaraan').value;

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

    // Melakukan pengecekan apakah ada perubahan pada data
    const dataToEdit = data.find(item => item.nik === nik);

    const dataHasChanged = Object.keys(updatedData).some(key => updatedData[key] !== dataToEdit[key]);

    if (!dataHasChanged) {
        alert('Tidak ada perubahan data.');
        closeModalEdit(); // Tutup modal jika tidak ada perubahan
        return;
    }

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
            filteredData = [...data];  // Menyaring data yang ada
            renderTable();  // Render tabel dengan data terbaru
            alert('Data berhasil diperbarui');
            closeModal();  // Menutup modal
        } else {
            console.error('Gagal memperbarui data');
            alert('Gagal memperbarui data');
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        alert('Terjadi kesalahan saat memperbarui data');
    }
}

function closeModalEdit() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
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

window.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(baseUrl);
    data = await response.json();
    filteredData = [...data];
    renderTable();
});

let currentStep = 0;
const steps = document.querySelectorAll('.step');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const saveButton = document.getElementById('save-button');

// Show current step
function showStep(stepIndex) {
    steps.forEach((step, index) => {
        step.classList.add('hidden'); // Hide all steps
        if (index === stepIndex) {
            step.classList.remove('hidden'); // Show the current step
        }
    });

    // Show or hide Previous and Next buttons
    if (stepIndex === 0) {
        prevButton.classList.add('hidden');
    } else {
        prevButton.classList.remove('hidden');
    }

    if (stepIndex === steps.length - 1) {
        nextButton.classList.add('hidden');
        saveButton.classList.remove('hidden');
    } else {
        nextButton.classList.remove('hidden');
        saveButton.classList.add('hidden');
    }
}

async function nextStep() {
    const currentStep = document.querySelector('.step:not(.hidden)');
    
    // Validasi langkah saat ini sebelum melanjutkan ke langkah berikutnya
    const isValid = await validateStep(currentStep);
    if (!isValid) {
        return;  // Hentikan proses jika validasi gagal
    }

    const nextStep = currentStep.nextElementSibling;

    if (nextStep && nextStep.classList.contains('step')) {
        currentStep.classList.add('hidden');
        nextStep.classList.remove('hidden');

        // Menyembunyikan tombol 'Next' jika berada di langkah terakhir
        if (!nextStep.nextElementSibling || !nextStep.nextElementSibling.classList.contains('step')) {
            document.getElementById('next-button').classList.add('hidden');
            document.getElementById('save-button').classList.remove('hidden');
        }

        // Menampilkan tombol 'Previous'
        document.getElementById('prev-button').classList.remove('hidden');
    }
}

// Previous button click handler
function prevStep() {
    const currentStep = document.querySelector('.step:not(.hidden)');
    const prevStep = currentStep.previousElementSibling;

    if (prevStep && prevStep.classList.contains('step')) {
        currentStep.classList.add('hidden');
        prevStep.classList.remove('hidden');

        // Hide previous button on the first step
        if (!prevStep.previousElementSibling || !prevStep.previousElementSibling.classList.contains('step')) {
            document.getElementById('prev-button').classList.add('hidden');
        }

        // Show next button
        document.getElementById('next-button').classList.remove('hidden');
        document.getElementById('save-button').classList.add('hidden');
    }
}

// Function to open the modal
function openModal() {
    document.getElementById('add-modal').classList.remove('hidden');
}

showStep(currentStep);


// Function to validate inputs in the current step
async function validateStep(step) {
    const inputs = step.querySelectorAll('input, select');
    
    // Cek apakah semua field sudah diisi
    for (const input of inputs) {
        if (!input.value.trim()) {
            alert("Semua data harus diisi!");
            return false;  // Jika ada field kosong, berhenti
        }

        // Validasi NIK (16 digit)
        if (input.id === 'nik' && !/^\d{16}$/.test(input.value)) {
            alert("NIK harus terdiri dari 16 digit!");
            return false;  // Jika NIK tidak valid, berhenti
        }
    }

    // Validasi NIK unik (jika langkah mengharuskan NIK)
    const nik = document.getElementById('nik').value;
    const isNikUnique = await checkNikUniqueness(nik);
    if (!isNikUnique) {
        alert("NIK sudah ada, silakan gunakan NIK yang lain!");
        return false;  // Jika NIK sudah ada, hentikan proses
    }

    return true;  // Semua field sudah terisi dan valid
}

function resetForm() {
    // Clear all inputs
    const inputs = document.querySelectorAll('#add-modal input, #add-modal select');
    inputs.forEach(input => input.value = '');

    // Hide all steps
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.add('hidden'));

    // Show the first step
    const firstStep = document.querySelector('.step');
    if (firstStep) firstStep.classList.remove('hidden');

    // Reset buttons
    document.getElementById('next-button').classList.remove('hidden');
    document.getElementById('prev-button').classList.add('hidden');
    document.getElementById('save-button').classList.add('hidden');
}

async function checkNikUniqueness(nik) {
    try {
        // Mengambil data dari API untuk memeriksa NIK
        const response = await fetch(`${baseUrl}check-nik/${nik}`);
        
        // Mengecek apakah respons berhasil
        if (response.ok) {
            const data = await response.json();
            
            // Jika NIK sudah ada, tampilkan alert
            if (data.isUnique === false) {
                return false;  // NIK sudah terdaftar, kembalikan false
            }
            
            // Jika NIK unik, kembalikan true
            return true;
        } else {
            console.error("Gagal memeriksa NIK");
            alert("Terjadi kesalahan saat memeriksa NIK.");
            return false;
        }
    } catch (error) {
        console.error("Error checking NIK uniqueness:", error);
        alert("Terjadi kesalahan, silakan coba lagi.");
        return false;
    }
}


function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
}

document.getElementById('edit-modal').addEventListener('click', function(event) {
    const modalContent = document.querySelector('#edit-modal > div');
    if (event.target === this) {
        closeEditModal(); 
    }
});


function handleSearch(event) {
    event.preventDefault(); // Mencegah form submit dan refresh halaman
    searchTable(); // Panggil fungsi searchTable
}

// Fungsi untuk menampilkan modal pencarian
function showSearchModal() {
    const modal = document.getElementById('searchModal');
    modal.classList.remove('hidden');  // Menghapus kelas 'hidden' untuk menampilkan modal
}
// Fungsi untuk menutup modal pencarian
function closeSearchModal() {
    const modal = document.getElementById('searchModal');
    modal.classList.add('hidden');  // Menambahkan kelas 'hidden' untuk menyembunyikan modal
}
