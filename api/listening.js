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

// Spotify's recently-played only logs a song once it has played long enough
// to count, and catches up late; skips never appear. So the history alone
// trails what's actually been on. Each time this sees the current song
// change, it remembers the one that just ended, and merges those in. That
// memory lives as long as this function instance stays warm, which is what
// covers someone watching the page while the music changes; the page keeps
// its own copy too, so a cold start can't take it back from them.
const seen=[];
let last=null;
const SAME=15*60*1000; // one song twice inside this window is one listen

function merge(current,lists){
  const all=[].concat(...lists).filter(t=>t&&t.id&&t.playedAt).sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt));
  const out=current?[current]:[];
  for(const t of all){
    const at=Date.parse(t.playedAt);
    if(current&&t.id===current.id&&Date.now()-at<SAME)continue;
    if(out.some(o=>o.id===t.id&&o.playedAt&&Math.abs(Date.parse(o.playedAt)-at)<SAME))continue;
    out.push(t);
    if(out.length>=KEEP)break;
  }
  return out;
}

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
    let current=null;
    // Whatever is loaded in the player comes first, playing or paused.
    // `timestamp` is when playback last changed: the pause, the skip.
    // Currently playing answers 204 with no body when nothing is loaded.
    if(nr.status===200){
      const d=await nr.json().catch(()=>null);
      if(d&&d.item){
        const at=d.timestamp?new Date(d.timestamp).toISOString():new Date().toISOString();
        current=shape(d.item,{playing:!!d.is_playing,paused:!d.is_playing,playedAt:d.is_playing?null:at});
        // the song before this one just ended, about when this one started
        if(last&&last.id!==current.id){
          seen.unshift(Object.assign({},last,{playing:false,paused:false,playedAt:at}));
          seen.length=Math.min(seen.length,KEEP);
        }
        last=current;
      }
    }
    const history=[];
    if(rr.ok){
      const d=await rr.json().catch(()=>null);
      for(const it of (d&&d.items)||[]){
        if(it.track)history.push(shape(it.track,{playing:false,paused:false,playedAt:it.played_at||null}));
      }
    }
    const tracks=merge(current,[history,seen]);
    res.setHeader('cache-control','public, max-age=0, s-maxage=15, stale-while-revalidate=30');
    res.status(200).json({configured:true,tracks});
  }catch(err){
    console.error('listening:',err.message);
    res.status(200).json({configured:true,error:true,tracks:[]});
  }
};
