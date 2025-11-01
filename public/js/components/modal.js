function showAlert(title, message) {
    const modalContent = `
        <div class="modal-content">
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="modal-buttons">
                <button id="okBtn" class="btn btn--primary">OK</button>
            </div>
        </div>
    `;

    showModal(modalContent, (modal) => {
        modal.querySelector('#okBtn').addEventListener('click', () => {
            removeModal();
        });
    });
}

function showConfirm(title, message) {
    return new Promise((resolve) => {
        const modalContent = `
            <div class="modal-content">
                <h2>${title}</h2>
                <p>${message}</p>
                <div class="modal-buttons">
                    <button id="confirmBtn" class="btn btn--primary">Confirm</button>
                    <button id="cancelBtn" class="btn btn--secondary">Cancel</button>
                </div>
            </div>
        `;

        showModal(modalContent, (modal) => {
            modal.querySelector('#confirmBtn').addEventListener('click', () => {
                removeModal();
                resolve(true);
            });

            modal.querySelector('#cancelBtn').addEventListener('click', () => {
                removeModal();
                resolve(false);
            });
        });
    });
}

function showModal(content, callback) {
    removeModal(); // Remove any existing modals

    const modalHtml = `
        <div class="confirmation-modal-overlay">
            <div class="confirmation-modal">
                ${content}
            </div>
        </div>
    `;

    const body = document.querySelector('body');
    body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.querySelector('.confirmation-modal-overlay');

    if (callback) {
        callback(modal);
    }
}

function removeModal() {
    const modal = document.querySelector('.confirmation-modal-overlay');
    if (modal) {
        modal.remove();
    }
}