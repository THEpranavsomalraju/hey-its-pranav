// Vercel serverless function: what I'm playing now and what I played before
// it, with album art, for the listening carousel on the home page.
//
// Same three env vars as now-playing.js, and the same token: it was minted
// with user-read-currently-playing and user-read-recently-played, which is
// all this needs.
//
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET
//   SPOTIFY_REFRESH_TOKEN
//
// Always answers 200. On any failure the page gets {tracks:[]} and the
// carousel simply doesn't render.

const TOKEN_URL='https://accounts.spotify.com/api/token';
const NOW_URL='https://api.spotify.com/v1/me/player/currently-playing';
const RECENT_URL='https://api.spotify.com/v1/me/player/recently-played?limit=30';
const KEEP=12;

// now-playing.js's trimming, plus "bonus": "- Remastered 2011", "(feat. …)" and the
// like are noise on a card this small.
const tidy=name=>String(name||'')
  .replace(/\s*[([](?:feat\.?|ft\.?|with|from|remaster|live|radio edit|single|extended|bonus)[^)\]]*[)\]]/ig,'')
  .replace(/\s*[-–—]\s*(?:from|feat\.?|ft\.?|with|remaster|live|radio edit|single version|extended|bonus).*$/i,'')
  .trim()||name||'';

function shape(item,extra){
  const images=(item.album&&item.album.images)||(item.images)||[];
  // the largest is 640px; plenty for a card, and Spotify's CDN serves it fast
  const image=images.length?images.reduce((a,b)=>(b.width||0)>(a.width||0)?b:a).url:null;
  const url=item.external_urls&&item.external_urls.spotify;
  return Object.assign({
    id:item.id,
    title:tidy(item.name),
    artist:(item.artists||[]).map(a=>a.name).join(', ')||(item.show&&item.show.name)||'',
    album:(item.album&&item.album.name)||'',
    image,
    url:typeof url==='string'&&url.startsWith('https://open.spotify.com/')?url:null
  },extra);
}

module.exports=async function handler(req,res){
  const id=process.env.SPOTIFY_CLIENT_ID;
  const secret=process.env.SPOTIFY_CLIENT_SECRET;
  const refresh=process.env.SPOTIFY_REFRESH_TOKEN;
  if(!id||!secret||!refresh){res.status(200).json({configured:false,tracks:[]});return}

  try{
    const auth=Buffer.from(id+':'+secret).toString('base64');
    const tr=await fetch(TOKEN_URL,{
      method:'POST',
      headers:{authorization:'Basic '+auth,'content-type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refresh})
    });
    if(!tr.ok)throw new Error('token exchange failed: '+tr.status);
    const {access_token}=await tr.json();
    const headers={authorization:'Bearer '+access_token};

    const [nr,rr]=await Promise.all([fetch(NOW_URL,{headers}),fetch(RECENT_URL,{headers})]);
    const tracks=[];
    // currently playing answers 204 with no body when nothing is on
    if(nr.status===200){
      const d=await nr.json().catch(()=>null);
      if(d&&d.item&&d.is_playing)tracks.push(shape(d.item,{playing:true,playedAt:null}));
    }
    if(rr.ok){
      const d=await rr.json().catch(()=>null);
      for(const it of (d&&d.items)||[]){
        if(!it.track)continue;
        // a song on repeat is one card, not five
        const prev=tracks[tracks.length-1];
        if(prev&&prev.id===it.track.id)continue;
        tracks.push(shape(it.track,{playing:false,playedAt:it.played_at||null}));
        if(tracks.length>=KEEP)break;
      }
    }
    res.setHeader('cache-control','public, max-age=0, s-maxage=15, stale-while-revalidate=30');
    res.status(200).json({configured:true,tracks});
  }catch(err){
    console.error('listening:',err.message);
    res.status(200).json({configured:true,error:true,tracks:[]});
  }
};
