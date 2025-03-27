

document.getElementById('loginBtn').addEventListener('click', async () => {

    try {

       const usernameData = document.getElementById('username').value;
       const passwordData = document.getElementById('password').value;
        
        const response = await fetch(`http://localhost:7890/api/auth/login`, {
            method: "POST",
            headers: {

                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: usernameData, password: passwordData })
        });

        console.log(response)
        const data = await response.json();
        console.log(data);
    
        

        if (response.ok) {

            window.location.href = "main.html";
        } else {
            alert('Erro no login');
        }
    } catch (error) {
        console.error("Erro:", error);
    }
});
