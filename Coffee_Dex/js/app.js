// Initialize Firebase
var config = {
	apiKey: "AIzaSyA8wmK8-privQ9gc8wiYvsETpYlHLiBGJ8",
	authDomain: "coffee-dex-a7a8d.firebaseapp.com",
	databaseURL: "https://coffee-dex-a7a8d.firebaseio.com",
	storageBucket: "coffee-dex-a7a8d.appspot.com",  
    };

// Get provider and authentication elements
var app = firebase.initializeApp(config);
var db = app.database();
var provider = new firebase.auth.GoogleAuthProvider();
const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const btnLogin = document.getElementById('btnLogin');
const btnSignup = document.getElementById('btnSignup');


/*
 * Called from SearchForCoffee.html
 *
 * Read search input box and list coffee(s) with matching name.
 * If search input box is blank, all coffees with be listed.
 * Each name will be a link to the coffee_hunter.html with relevant data.
 *
 */
function listCoffees() {
	var input = document.getElementById("coffee").value;
	document.getElementById("div1").innerHTML = "";
	if (input === "") {
		db.ref('coffees').on('value', function(snapshot) {
			snapshot.forEach(function(Snapshot) {
				var para = document.createElement("p");
				var a_tag = document.createElement("a");
				para.appendChild(a_tag);
				var node = document.createTextNode(Snapshot.val().name);
				a_tag.appendChild(node);
				var name = Snapshot.val().name;
				a_tag.href = "./coffee_hunter.html?"+name;
				var element = document.getElementById("div1");
				element.appendChild(para);
			});
		});
	}
	else {
		db.ref('coffees').orderByChild("name").equalTo(input).on('value', function(snapshot) {
			snapshot.forEach(function(Snapshot) {
				if (typeof Snapshot.val().name !== "undefined") {
					var para = document.createElement("p");
					var a_tag = document.createElement("a");
					para.appendChild(a_tag);
					var node = document.createTextNode(Snapshot.val().name);
					a_tag.appendChild(node);
					var name = Snapshot.val().name;
					a_tag.href = "./coffee_hunter.html?"+name;
					var element = document.getElementById("div1");
					element.appendChild(para);
				}
			});
		});
	}
}

/*
 * Called from CoffeeStorage.html 
 *
 * Lists all coffees in user favorites database.
 * Each name will be a link to the coffee_hunter.html with relevant data.
 *
 */
function listFavorite() {
	document.getElementById("favorite").innerHTML = "";
	var ref = db.ref('users/' + firebase.auth().currentUser.uid + '/favorites');
	ref.on('value', function(snapshot) {
		snapshot.forEach(function(Snapshot) {
			if (typeof Snapshot.val().name !== "undefined") {
				var list = document.createElement("li");
				var a_tag = document.createElement("a");
				list.appendChild(a_tag);
				var node = document.createTextNode(Snapshot.val().name);
				a_tag.appendChild(node);
				var name = Snapshot.val().name;
				a_tag.href = "./coffee_favorites.html?"+name+"&"+firebase.auth().currentUser.uid;
				var element = document.getElementById("favorite");
				element.appendChild(list);
			}
		});
	});
}

/*
 * Called from coffee_hunter.html 
 *
 * Adds a coffee to user favorites database.
 * User will be prompted to confirm before add is initiated.
 *
 */
function userAddFavorite() {
	if (confirm("Would you like to add this coffee to your favorites list?")) {
		var ref = db.ref('users/' + firebase.auth().currentUser.uid + '/favorites');
		var coffeename = document.getElementById("name").value;
		db.ref('coffees').on('value', function(snapshot) {
			snapshot.forEach(function(Snapshot) {
				if (Snapshot.val().name === coffeename) {
					ref.push(Snapshot.val());
					console.log("Add succeeded.");
					window.location.href = './SearchForCoffee.html'
				}
			});
		});
	}
	else {
		return false;
	}
}

/*
 * Called from coffee_favorites.html 
 *
 * Removes a coffee from user favorites database.
 * User will be prompted to confirm before remove is initiated.
 *
 */
function userRemoveFavorite() {
	if (confirm("Would you like to remove this coffee from your favorites list?")) {
		var ref = db.ref('users/' + firebase.auth().currentUser.uid + '/favorites');
		var coffeename = document.getElementById("name").value;
		ref.on('value', function(snapshot) {
			snapshot.forEach(function(Snapshot) {
				if (Snapshot.val().name === coffeename) {			
					remRef = db.ref('users/' + firebase.auth().currentUser.uid + '/favorites/' + Snapshot.key);
					remRef.set(null)
						.then(function() {
				    	console.log("Remove succeeded.");
				    	window.location.href = './CoffeeStorage.html'
				  	})
				  	.catch(function(error) {
				    	console.log("Remove failed: " + error.message);
				  	});
				}
			});
		});
	}
	else {
		return false;
	}
}

/*
 * Called from coffee_favorites.html
 *
 * Updates a coffee in user favorites database with given notes.
 * User will be prompted to confirm before update is initiated.
 *
 */
function userUpdateFavorite() {
	if (confirm("Would you like to update your notes for this coffee?")) {
		var ref = db.ref('users/' + firebase.auth().currentUser.uid + '/favorites');
		var coffeename = document.getElementById("name").value;
		ref.on('value', function(snapshot) {
			snapshot.forEach(function(Snapshot) {
				
				if (Snapshot.val().name === coffeename) {			
					remRef = db.ref('users/' + firebase.auth().currentUser.uid + '/favorites/' + Snapshot.key);
					remRef.set({
					image_url: Snapshot.val().image_url, 
				    link: Snapshot.val().link,
				    location: Snapshot.val().location,
				    name: Snapshot.val().name,
				    notes: document.getElementById("note").value,
				    price: Snapshot.val().price,
				    rating: Snapshot.val().rating,
				    served: Snapshot.val().served
				  })
						.then(function() {
				    	console.log("Update succeeded.");
				    	location.reload();
				  	})
				  	.catch(function(error) {
				    	console.log("Update failed: " + error.message);
				  	});
				}
			});
		});
	}
	else {
		return false;
	}
}

/*
 * Called from login.html
 *
 * Attempts to log user in by querying Firebase user database.
 * If the email is poorly formatted or the user is not registered, an error will be thrown.
 *
 */
function userLogin() {
	const email = txtEmail.value;
	const password = txtPassword.value;
	const auth = firebase.auth();
	const promise = auth.signInWithEmailAndPassword(email, password);
	promise.catch(e => console.log(e.message));
}

/*
 * Called from login.html
 *
 * Attempts to register a new user by adding email/password combination to Firebase user database.
 * If the email is poorly formatted, an error will be thrown.
 * Upon successful registration, the user will me alerted and automatically logged in.
 *
 */
function userSignup() {
	const email = txtEmail.value;
	const password = txtPassword.value;
	const auth = firebase.auth();
	const promise = auth.createUserWithEmailAndPassword(email, password);
	promise.catch(e => console.log(e.message));
	promise.then(firebaseUser => {
		alert("You have signed up and logged in successfully!");
	});
} 

/*
 * Called from login.html
 *
 * Registers a new user or logs in with an existing user using the Google API.
 * Google account will be either added to or searched for in Firebase user database.
 * Upon successful registration, the user will automatically logged in.
 *
 */
function googleLogin() {
	firebase.auth().signInWithPopup(provider).then(function(result) {
	console.log("During");
  var token = result.credential.accessToken;
  var user = result.user;
	}).catch(function(error) {
	  	var errorCode = error.code;
	  	var errorMessage = error.message;
	  	var email = error.email;
	  	var credential = error.credential;
		});
}

/*
 * Called from main_page.html
 *
 * Logs current user out with Firebase API call.
 *
 */
function userLogout() {
	if (confirm('Do you want to logout?')) {
		firebase.auth().signOut();
		console.log('You have been logged out successfully!');
		window.location.href = "./login.html";
	} 
}

/*
 * Real-time listener
 *
 * Constantly checks to see if current user is logged in.
 * If user is logged in and/or the site remembers them, 
 * they will automatically bypass the login page.
 * If user is not logged in, they will be returned to the login page.
 *
 */
firebase.auth().onAuthStateChanged(firebaseUser => {
	if (firebaseUser && window.location.href.includes("login")) {
		window.location.href = "./main_page.html";
	} 
	if (!firebaseUser && !window.location.href.includes("login")) {
		window.location.href = "./login.html";
	}
}); 

/*
 * Called from coffee_hunter.html
 *
 * Loads fields, based on a given coffee name, from the constrained coffee database.
 *
 */
function loadCoffee() {
	var temp = location.search.substring(1);
	var name = temp.replace("%20", " ");
	if (name === "random") {
		db.ref('coffees').on('value', function(snapshot) {
			snapshot.forEach(function(Snapshot) {
				if (Math.random() > 0.5) {
					var coffeeimg = document.getElementById("coffeeimg");
       				coffeeimg.src = Snapshot.val().image_url;
					document.getElementById('name').value = Snapshot.val().name;
					document.getElementById('served').value = Snapshot.val().served;
					document.getElementById('price').value = Snapshot.val().price;
					document.getElementById('link').value = Snapshot.val().link;
					document.getElementById('location').value = Snapshot.val().location;
				}
			});
		});	
	}
	else {
		db.ref('coffees').orderByChild("name").equalTo(name).on('value', function(snapshot) {
			snapshot.forEach(function(Snapshot) {
				var coffeeimg = document.getElementById("coffeeimg");
       				coffeeimg.src = Snapshot.val().image_url;
					document.getElementById('name').value = Snapshot.val().name;
					document.getElementById('served').value = Snapshot.val().served;
					document.getElementById('price').value = Snapshot.val().price;
					document.getElementById('link').value = Snapshot.val().link;
					document.getElementById('location').value = Snapshot.val().location;
			});
		});
	}
}

/*
 * Called from coffee_favorites.html
 *
 * Loads fields, based on a given coffee name, from the user favorite database.
 *
 */
function loadFavorite() {
	var params = location.search.substring(1).split("&");
	var name = params[0].replace("%20", " ");
	var userId = params[1];
	var ref = db.ref('users/' + userId + '/favorites');
	ref.orderByChild("name").equalTo(name).on('value', function(snapshot) {
		snapshot.forEach(function(Snapshot) {
				var coffeeimg = document.getElementById("coffeeimg");
       			coffeeimg.src = Snapshot.val().image_url;
				document.getElementById('name').value = Snapshot.val().name;
				document.getElementById('served').value = Snapshot.val().served;
				document.getElementById('price').value = Snapshot.val().price;
				document.getElementById('link').value = Snapshot.val().link;
				document.getElementById('location').value = Snapshot.val().location;
				document.getElementById('note').value = Snapshot.val().notes;
		});
	});
}
