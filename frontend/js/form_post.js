//Vérifier si l'utilisateur est connecté, sinon renvoyer l'utilisateur vers la page de login
const headers = {
    headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
    }
}

// Affichage Nom et prénom de l'utilisateur
axios.get('http://localhost:3000/api/users/me', headers).then((res) => {
    displayName(res.data)

}).catch(() => {
    window.location.href = 'login.html'
})

function displayName(userData) {
    document.querySelector('.firstname').textContent = userData.firstname;
    document.querySelector('.lastname').textContent = userData.lastname;
}

//Envoie data de chaque post
function addPost(event) {
    event.preventDefault();
    const postData = {};
    postData.title = event.target.title.value;
    postData.contentPost = event.target.contentPost.value;
    postData.attachment = event.target.attachment.value;
    console.log(postData)
    // const postString = JSON.stringify(postData);
    // console.log(postString)
    console.log(headers)

    axios.post('http://localhost:3000/api/posts/new', postData, headers).then((res) => {
        const data = res.data
        console.log(data)
        // localStorage.setItem("postData", JSON.stringify(data.postData)) // on converti la liste en string pour qu'elle soit lisible par javascript. 
        // localStorage.setItem('token', data.token);
        window.location.href = 'index.html'; // Redirection vers la page d'accueil
        }).catch(() => {
            console.log('erreur catch')
            // window.location.href = 'login.html'
        })
}

document.getElementById('form').addEventListener('submit', addPost);