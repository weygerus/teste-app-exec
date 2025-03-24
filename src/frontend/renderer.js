

document.getElementById('loginBtn').addEventListener('click', async () => {

    try {
      
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        console.log(username, password)

        const response = await fetch(`http://localhost:6890/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href = "main.html";
        } else {
            alert('Erro no login');
        }
    } catch (error) {
        console.error("Erro:", error);
    }
});
