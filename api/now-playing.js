// Vercel serverless function: what I'm listening to on Spotify.
//
// Access tokens last an hour, so the long-lived refresh token does the work.
// It and the client secret stay here on the server — never in js/script.js,
// which anyone can read. Set these three in the Vercel project settings:
//
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET
//   SPOTIFY_REFRESH_TOKEN     (mint once via scripts/spotify-token.mjs)
//
// Always answers 200. The sticker is decoration — it should never turn into
// an error on the page, it just doesn't render.

const TOKEN_URL='https://accounts.spotify.com/api/token';
const NOW_URL='https://api.spotify.com/v1/me/player/currently-playing';
const RECENT_URL='https://api.spotify.com/v1/me/player/recently-played?limit=1';

module.exports=async function handler(req,res){
  const id=process.env.SPOTIFY_CLIENT_ID;
  const secret=process.env.SPOTIFY_CLIENT_SECRET;
  const refresh=process.env.SPOTIFY_REFRESH_TOKEN;
  if(!id||!secret||!refresh){
    res.status(200).json({configured:false});
    return;
  }

  try{
    const auth=Buffer.from(id+':'+secret).toString('base64');
    const tr=await fetch(TOKEN_URL,{
      method:'POST',
      headers:{
        authorization:'Basic '+auth,
        'content-type':'application/x-www-form-urlencoded'
      },
      body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refresh})
    });
    if(!tr.ok)throw new Error('token exchange failed: '+tr.status);
    const {access_token}=await tr.json();
    const headers={authorization:'Bearer '+access_token};

    // currently playing comes back 204 with no body when nothing is on
    let item=null,playing=false;
    const nr=await fetch(NOW_URL,{headers});
    if(nr.status===200){
      const d=await nr.json().catch(()=>null);
      if(d&&d.item){item=d.item;playing=!!d.is_playing}
    }
    if(!item){
      const rr=await fetch(RECENT_URL,{headers});
      if(rr.ok){
        const d=await rr.json().catch(()=>null);
        item=d&&d.items&&d.items[0]&&d.items[0].track||null;
      }
    }
    if(!item){res.status(200).json({configured:true});return}

    // podcasts carry a show instead of artists
    const artist=(item.artists||[]).map(a=>a.name).join(', ')
      ||(item.show&&item.show.name)||'';

    // Spotify hangs a lot on the end of a title — "- From ...", "(feat. ...)",
    // "- Remastered 2011". It reads as noise on a sticker this small, and it is
    // what pushes the real name out past the ellipsis. A dash only counts when
    // one of these words follows, so "Hello - Goodbye" survives intact.
    const title=String(item.name||'')
      .replace(/\s*[([](?:feat\.?|ft\.?|with|from|remaster|live|radio edit|single|extended)[^)\]]*[)\]]/ig,'')
      .replace(/\s*[-–—]\s*(?:from|feat\.?|ft\.?|with|remaster|live|radio edit|single version|extended).*$/i,'')
      .trim()||item.name||'';

    // max-age=0 so the browser always asks; the short s-maxage keeps the edge
    // from hammering Spotify while still tracking a track change quickly
    res.setHeader('cache-control','public, max-age=0, s-maxage=10, stale-while-revalidate=20');
    res.status(200).json({
      configured:true,
      playing,
      title,
      artist,
      url:item.external_urls&&item.external_urls.spotify||null
    });
  }catch(err){
    console.error('now-playing:',err.message);
    res.status(200).json({configured:true,error:true});
  }
};
