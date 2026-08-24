// One-time helper: mint the Spotify refresh token for /api/now-playing.
//
// Run it locally, never on the server. Put the credentials in .env (which is
// gitignored) and let node read them, so they never reach your shell history:
//
//   SPOTIFY_CLIENT_ID=...
//   SPOTIFY_CLIENT_SECRET=...
//
//   node --env-file=.env scripts/spotify-token.mjs
//
// In the Spotify dashboard, the app's Redirect URIs must include exactly:
//   http://127.0.0.1:8888/callback
// (Spotify requires the literal loopback IP here — "localhost" is rejected.)
//
// Node builtins only, so there is nothing to install.

import http from 'node:http';
import {randomBytes} from 'node:crypto';

const id=process.env.SPOTIFY_CLIENT_ID;
const secret=process.env.SPOTIFY_CLIENT_SECRET;
if(!id||!secret){
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET, then re-run.');
  process.exit(1);
}

const REDIRECT='http://127.0.0.1:8888/callback';
const SCOPES='user-read-currently-playing user-read-recently-played';
const state=randomBytes(16).toString('hex');

const authUrl='https://accounts.spotify.com/authorize?'+new URLSearchParams({
  response_type:'code',client_id:id,scope:SCOPES,redirect_uri:REDIRECT,state
});

const done=(server,code)=>{server.close();process.exit(code)};

const server=http.createServer(async (req,res)=>{
  const url=new URL(req.url,REDIRECT);
  if(url.pathname!=='/callback'){res.writeHead(404).end();return}

  const err=url.searchParams.get('error');
  const code=url.searchParams.get('code');
  if(err||url.searchParams.get('state')!==state||!code){
    res.writeHead(400,{'content-type':'text/plain'})
       .end('Authorization failed: '+(err||'state mismatch'));
    console.error('\nAuthorization failed:',err||'state mismatch');
    done(server,1);
    return;
  }

  try{
    const r=await fetch('https://accounts.spotify.com/api/token',{
      method:'POST',
      headers:{
        authorization:'Basic '+Buffer.from(id+':'+secret).toString('base64'),
        'content-type':'application/x-www-form-urlencoded'
      },
      body:new URLSearchParams({grant_type:'authorization_code',code,redirect_uri:REDIRECT})
    });
    const d=await r.json();
    if(!r.ok||!d.refresh_token)throw new Error(d.error_description||d.error||('HTTP '+r.status));

    res.writeHead(200,{'content-type':'text/plain'})
       .end('Done. Copy the refresh token from your terminal, then close this tab.');
    console.log('\nSPOTIFY_REFRESH_TOKEN=\n'+d.refresh_token+'\n');
    console.log('Add that to your Vercel project env vars, alongside the id and secret.');
    done(server,0);
  }catch(e){
    res.writeHead(500,{'content-type':'text/plain'}).end('Token exchange failed.');
    console.error('\nToken exchange failed:',e.message);
    done(server,1);
  }
});

server.listen(8888,'127.0.0.1',()=>{
  console.log('Open this in your browser and approve:\n\n'+authUrl+'\n');
  console.log('Waiting on http://127.0.0.1:8888/callback ...');
});
