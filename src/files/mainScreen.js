document.addEventListener("DOMContentLoaded", () => {

    loadSessions();

    const token = localStorage.getItem("accessToken");
    console.log(token)
});

async function togglePopup(show) {

    const popup = document.getElementById("registerPopup");

    if (show) {

        popup.classList.remove("hidden");
    }
    else {

        popup.classList.add("hidden");
    }
}


document.getElementById("menuButton").addEventListener("click", async (event) => {

    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"))

    const menuPopup = document.getElementById("menuPopup");

    if(menuPopup.className.includes("hidden")) {

        menuPopup.classList.remove("hidden");
    }
    else {

        menuPopup.classList.add("hidden");
    }

    const usernametitle = document.getElementById("menuPoppupUsernameTitle");
    usernametitle.innerText = `${user.username}`;

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", async () => { await asyncLogout()})

    const mainNav = document.getElementById("mainNav");
    mainNav.classList.add("openPopup");

});

async function asyncLogout() {
    
    const cardContainer = document.getElementById("createCardContainer");
    
    const cardHtml = `
    
        <div class="deleteAccountConfirmCard  fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="logoutConfirmCard bg-white p-6 shadow-lg text-center w-auto relative">
            
                <h2>Desconectar?</h2>
    
                <div class="btns_confirmdeleteAccount_container">
                
                    <button class="deleteAccountCancelButton text-gray-700 bg-gray-300 hover:bg-gray-400" onclick="canceldeleteAccount()">
                        Cancelar
                    </button>
                    <button class="deleteAccountConfirmBtn" id="confirmLogout">
                        Sair
                    </button>
                </div>
            </div>
        </div>
        `
    
        cardContainer.innerHTML = cardHtml;

        document.getElementById("confirmLogout").addEventListener("click", async (event) => {
        
            event.preventDefault();
        
            try {
                
                console.log("OKKKKKK")
                const accessToken = localStorage.getItem("accessToken");
        
                const response = await fetch("https://gerenc-insta-deld.onrender.com/api/auth/logout", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                },);
        
                const data = await response.json();
                console.log("Resposta: ", data);
        
                if (response.ok) {
        
                    await removeLocalStorageItems();
                    await clearCookies();
        
                    console.log("Logout completo, redirecionando...")
               
                } else {
        
                    console.error("Erro ao realizar logout.");
                }
            } catch (error) {
        
                console.error("Erro ao tentar fazer logout:", error);
            }
        });

}


        async function removeLocalStorageItems() {

            localStorage.removeItem("instaAuth");
            localStorage.removeItem("data");
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("secondaryAccounts");
            localStorage.removeItem("sholudVerifyAction");
            localStorage.removeItem("logLevel");
            localStorage.removeItem("instaAccounts");
            localStorage.removeItem("instaLoginErrors");
            localStorage.removeItem("actionForAccounts");
            localStorage.removeItem("connectionUrl");
        
            console.log('items removidos');
        }
        
        async function clearCookies() {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].split('=');
                const cookieName = cookie[0].trim();
        
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                console.log('1 cookie limpo', cookieName);
            }
        }
        


document.getElementById("button-add-account").addEventListener("click", () => togglePopup(true));
document.getElementById("registerPopupCancelButton")?.addEventListener("click", () => togglePopup(false));



document.getElementById('registerPopupSubmmitButton').addEventListener('click', async (event) => {

    event.preventDefault()

    // captura de dados
    const instaUsername = document.getElementById("instaUsernameInput").value;
    const instaPassword = document.getElementById("instaPasswordInput").value;
    const confirmInstaPasswordInput = document.getElementById("confirmInstaPasswordInput").value;

    if (instaPassword != confirmInstaPasswordInput) {

        alert("As senhas são diferentes, tente novamente!")
    }
    else {

        const accessToken = localStorage.getItem("accessToken");
        const user = JSON.parse(localStorage.getItem("user"))

        const addAccountLoadingCard = document.getElementById("addAccountLoadingCard");
        addAccountLoadingCard.classList.remove("hidden");

        try {

            const response = await fetch('http://localhost:7890/api/instaAuth/addInstaAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    _id: user._id,
                    username: user.username,
                    instaUsername: instaUsername,
                    instaPassword: instaPassword
                })
            });

            const data = await response.json();
            console.log("ERRO ADDACCOUNT: ", data, typeof data.error);

            if (data.error.error.includes("We can send you an email to help you get back into your account.")) {

                if (data.error) {

                    const errors = [];
                    errors.push(data.error);
                }

                togglePopup(false);
                addAccountLoadingCard.classList.add("hidden");

                await displayNoneErrorSessionsCard(`Houve uma falha ao realizar o Login do usuário ${data.error.username}, redefina sua senha e tente novamente!`)
            }
            else if (data.message.includes('Já existe uma conta com este username.')) {

                togglePopup(false);
                addAccountLoadingCard.classList.add("hidden");

                setTimeout(async () => {

                    await displayNoneErrorSessionsCard(`Login da conta ${data.instaUsername} realizado com sucesso!`);
                    await loadSessions();
                }, 1000);
            }
            else {

                addAccountLoadingCard.classList.add("hidden");
                togglePopup(false);

                console.log(data.user);
                localStorage.setItem("data", data);
                localStorage.setItem("user", JSON.stringify(data.user));

                setTimeout(async () => {

                    await displayNoneErrorSessionsCard(`Login da conta ${data.instaUsername} realizado com sucesso!`);
                    await loadSessions();
                }, 300);

            }
        } catch (error) {

            console.log(`Erro ao registrar conta do Instagram: ${error}`);
            setTimeout(async () => {

                addAccountLoadingCard.classList.add("hidden");

                togglePopup(false);
                await createErrorCard(error);

                loadSessions();
            }, 1000);
        }
    }
});

// Alterna as abas
function openTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    // Remove classe 'active' de todos os botões
    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("active");
    });

    // Mostra a aba selecionada
    document.getElementById(tabId).classList.add("active");


    document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
}


async function createSuccessCard(message) {

    const cardContainer = document.getElementById("createCardContainer");

    const card = document.createElement('div');
    const closeCardButton = document.createElement('a');
    closeCardButton.textContent = "X"

    card.classList.add("card", "sucessCardStyle");
    closeCardButton.classList.add("closeCardButtonStyle");

    card.innerText = message;
    cardContainer.appendChild(card);

    closeCardButton.onclick = () => {
        card.remove();
    };

    setTimeout(() => {
        card.remove();
    }, 4000);
}

async function loadSessions() {

    const activeList = document.getElementById("active-list");
    const errorList = document.getElementById("error-list");


    const user = JSON.parse(localStorage.getItem("user"));
    console.log(user)
    const userId = user._id;

    const token = localStorage.getItem("accessToken");

    activeList.innerHTML = "";
    errorList.innerHTML = "";

    try {
        const response = await fetch(`https://gerenc-insta-deld.onrender.com/api/instaAuth/loadInstaSessions/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        console.log("USERDATA: ", data);

        data.sessions.forEach(session => {
            const card = createSessionCard(session.username, true);
            activeList.appendChild(card);
        });

        localStorage.setItem("ErrorsNull", "Is");

        if (data.errors && data.errors.length > 0) {

            data.errors.forEach(session => {
                const card = createSessionCard(session.username, false, session.message);
                errorList.appendChild(card);
            });
        }
        if (!data.errors || data.errors.length == 0) {

            localStorage.setItem("ErrorsNull", "Null");
        }



    } catch (error) {
        console.error("Erro ao carregar sessões:", error);
    }
}

// Criar um card de sessão
function createSessionCard(username, isActive, message = "") {
    const card = document.createElement("div");
    card.classList.add("session-card");

    if (isActive) {

        card.innerHTML = `
        <span>
        ${username} ${message ? "- " + message : ""}
        </span>

        <input type="text" id="usernameValueInput" style="display: none;">
        <div class="btns_container">
            <button class="edit_button" onclick="reloadSession('${username}')">
                <i class="edit_icon fa-solid fa-pencil"></i>
            </button>
            <button class="remove_button" onclick="deleteAccount('${username}')">
                <i class="remove_icon fa-solid fa-trash"></i>
            </button>
        </div>
        
        
    `;
    }
    else {

        card.innerHTML = `
            <span>
                ${username} ${message ? "- " + message : ""}
            </span>
            
            <input type="text" id="usernameValueInput" style=" display: none;">

            <div class="btns_container">
                <button class="reload-button" onclick="reloadSession(${username})">
                    <i class="reload_icon fa-solid fa-rotate-right"></i>
                </button>
                    <button class="remove-button" onclick="deleteAccount('${username}')">
                    <i class="remove_icon fa-solid fa-trash"></i>
                </button>
            </div>

            
        `;
    }


    return card;
}

async function createErrorCard(message) {

    const cardsContainer = document.getElementById("createCardContainer")
    const card = document.createElement('div');

    card.classList.add("card", "errorCardStyle")

    card.innerText = `${message}`;
    cardsContainer.appendChild(card);

    setTimeout(() => {
        card.remove();
    }, 4000);
}

function reloadAllSessions() {
    alert("Recarregando todas as sessões ativas...");
}

function reloadAllErrors() {
    alert("Recarregando todas as sessões com erro...");
}

function editAccount(username) {

    alert(`Editar sessão de ${username}... Ainda não implementado`);
}

async function displayLoadingCard(message) {

    const cardHtml = `

        <div class="LoadingCard fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class=" bg-white p-6 shadow-lg text-center w-auto relative">

                <h2>${message}</h2>
                <div class="custom_loading_spinner animate-spin rounded-full h-8 w-8 border-t-2 border-pink-500"></div>
            </div>
        </div>
    `

    return cardHtml;
}

async function canceldeleteAccount() {

    const cardContainer = document.getElementById("createCardContainer");
    cardContainer.innerHTML = "";
}

async function deleteAccount(accountUsername) {

    const cardContainer = document.getElementById("createCardContainer");

    const cardHtml = `

        <div class="deleteAccountConfirmCard fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 shadow-lg text-center w-auto relative">
            
                <h2>Deseja apagar a conta ${accountUsername}?</h2>

                <div class="btns_confirmdeleteAccount_container">
                
                    <button class="deleteAccountCancelButton text-gray-700 bg-gray-300 hover:bg-gray-400" onclick="canceldeleteAccount()">
                        Cancelar
                    </button>
                    <button class="deleteAccountConfirmBtn" onclick="confirmDeleteAccount('${accountUsername}')">
                        Apagar
                    </button>
                </div>
            </div>
        </div>
        `

    cardContainer.innerHTML = cardHtml;
}

async function confirmDeleteAccount(username) {

    console.log(`Deletando a sessão de ${username}...`);
    console.log("FOI: ", username);

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user._id

    const deleteLoadingCard = document.getElementById("deleteLoadingCard");
    deleteLoadingCard.classList.remove("hidden");

    const token = localStorage.getItem("accessToken");

    try {

        const response = await fetch(`http://localhost:7890/api/instaAuth/deleteAccount/${userId}/${username}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log("FOI: ", data);

        setTimeout(async () => {

            deleteLoadingCard.classList.add("hidden");
            await displayNoneErrorSessionsCard("Sessão deletada com sucesso!")
            await loadSessions();
        }, 4000);
    }
    catch (error) {

        setTimeout(async () => {

            deleteLoadingCard.classList.add("hidden");
            await loadSessions();
        }, 4000);
    }
}

async function displayNoneErrorSessionsCard(message = "none") {

    const cardContainer = document.getElementById("createCardContainer");

    console.log(message);

    if (message.includes("Houve uma falha ao realizar o Login do usuário")) {

        const cardHtml = `

        <div class="nullErrorsCard fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            
            <div class="bg-white p-6 shadow-lg text-center w-auto relative">

                <h2>${message}</h2>
                <a id="closeCardButton" class="closeCardButtonStyle">Redefinir minha senha</a>
            </div>
        </div>
        `

        cardContainer.innerHTML = cardHtml;
    }
    else if (message == "Sessão deletada com sucesso!" || message.includes("realizado com sucesso!")) {

        const cardHtml = `

        <div class="nullErrorsCard fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            
            <div class="bg-white p-6 shadow-lg text-center w-auto relative">

                <h2>${message}</h2>
                <a id="closeCardButton" class="closeCardButtonStyle">OK</a>
            </div>
        </div>
        `

        cardContainer.innerHTML = cardHtml;
    }
    else if (message == "none") {

        const cardHtml = `

            <div class="nullErrorsCard fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white p-6 shadow-lg text-center w-auto relative">

                    <h2>Opa! Parece que você não tem contas com erro..</h2>
                    <h2>Continue Webinando!</h2>
                    <a id="closeCardButton" class="closeCardButtonStyle">OK</a>
                </div>
            </div>
        `

        cardContainer.innerHTML = cardHtml;
    }

    const closeCardButton = document.getElementById("closeCardButton")
    closeCardButton.onclick = () => {

        openTab("active-sessions");
        cardContainer.innerHTML = "";
    };
}

function openTab(tabName) {

    console.log(tabName);
    const allTabs = document.querySelectorAll('.tab-content');

    allTabs.forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove a classe 'active' de todos os botões
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Exibe a aba selecionada
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }

    // Adiciona a classe 'active' no botão da aba selecionada
    const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');

        const errorsIsNull = localStorage.getItem("ErrorsNull");

        if (errorsIsNull == "Null" && tabName == "error-sessions") {

            displayNoneErrorSessionsCard();

        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    openTab('active-sessions'); // Inicializa com a aba "Sessões Ativas" aberta
});
