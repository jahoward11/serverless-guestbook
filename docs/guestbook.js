/**
 * Web application
 */
(function() {
  var entriesTemplate, tokens;
  const apiUrl = 'https://9e036e2d.us-south.apigw.appdomain.cloud/guestbook';
  
  const guestbook = {
    // retrieve the existing guestbook entries
    get() {
      return $.ajax({
        type: 'GET',
        url: `${apiUrl}/entries`,
        dataType: 'json',
        headers: { 'Authorization': 'Bearer ' + (tokens && tokens.accessToken) },
      });
    },
    // add a single guestbood entry
    add(name, email, comment) {
      console.log('Sending', name, email, comment)
      return $.ajax({
        type: 'PUT',
        url: `${apiUrl}/entries`,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
          name,
          email,
          comment,
        }),
        dataType: 'json',
        headers: { 'Authorization': 'Bearer ' + (tokens && tokens.accessToken) },
      });
    }
  };

  function prepareTemplates() {
    entriesTemplate = Handlebars.compile($('#entries-template').html());
  }

  // retrieve entries and update the UI
  function loadEntries() {
    console.log('Loading entries...');
    $('#entries').html('Loading entries...');
    guestbook.get().done(function(result) {
      if (!result.entries) {
        return;
      }
      const context = {
        entries: result.entries
      }
      $('#entries').html(entriesTemplate(context));
    }).error(function(error) {
      $('#entries').html('No entries');
      console.log(error);
    });
  }

  // intercept the click on the submit button, add the guestbook entry and
  // reload entries on success
  $(document).on('submit', '#addEntry', function(e) {
    e.preventDefault();
    /*
    if (!tokens || !tokens.accessTokenPayload.roles
    || !tokens.accessTokenPayload.roles.some(r => /^lead$/i.test(r))) {
      console.log("Lead role is required.");
      return;
    }
    */
    guestbook.add(
      $('#name').val().trim(),
      $('#email').val().trim(),
      $('#comment').val().trim()
    ).done(function(result) {
      // reload entries
      loadEntries();
    }).error(function(error) {
      console.log(error);
    });
  });

  (async function() {
    prepareTemplates();

    const appID = new AppID();
    try {
      await appID.init({
        clientId: 'c570c7f9-e551-4ecf-8003-690f379d40fb',
        discoveryEndpoint: 'https://us-south.appid.cloud.ibm.com/oauth/v4/e66d3795-51bb-48ad-9b9c-ae7ebe0ece27/.well-known/openid-configuration'
      });
    } catch (e) {
      console.error(e);
      //document.getElementById('error').textContent = e;
      return;
    }
    try {
      tokens = await appID.silentSignin();
      //if (tokens) {
        //document.getElementById('id_token').textContent = JSON.stringify(tokens.idTokenPayload);
      //}
    } catch (e) {
      console.error(e);
    }
    document.querySelector('#login').addEventListener('click', async () => {
      //document.getElementById('login').setAttribute('class', 'hidden');
      //document.getElementById('error').textContent = '';
      try {
        tokens = await appID.signin();
        /* // if you're working with the Node.js SDK
        appID.get("/protected", passport.authenticate(WebAppStrategy.STRATEGY_NAME), function(req, res){
          if(WeAppStrategy.hasScope(req, "read write")){
            res.json(req.user);
          }
          else {
            res.send("insufficient scopes");
          }
        });
        */
        //if (tokens.accessTokenPayload.roles
        //&& tokens.accessTokenPayload.roles.some(r => r.name === "Contributor")) {
        /*
        if (tokens.accessTokenPayload.roles
        && tokens.accessTokenPayload.roles.some(r => /^contributor$/i.test(r))) {
          loadEntries();
        }
        */
        loadEntries();
        //let userInfo = await appID.getUserInfo(tokens.accessToken);
        //let decodeIDToken = tokens.idTokenPayload;
        //document.getElementById('welcome').textContent = 'Hello, ' + decodeIDToken.name;
        //document.getElementById('id_token').textContent = JSON.stringify(decodeIDToken);
        //document.getElementById('user_info').textContent = JSON.stringify(userInfo);
      } catch (e) {
        console.error(e);
      }
    });
    document.querySelector('#changePassword').addEventListener('click', async () => {
      if (!tokens) { console.log("Log in first."); return; }
      try {
        await appID.changePassword(tokens.idToken);
      } catch (e) {
        console.error(e);
      }
    });
  })();
})();
