// Vercel serverless function: my GitHub contribution calendar, for the
// skyline on the home page.
//
// With GITHUB_TOKEN set in the Vercel project settings (a fine-grained token
// with no scopes is enough, it only reads public profile data) this asks the
// GraphQL API, which is the supported route and counts private contributions
// too if the profile shares them. Without it, it reads the same public
// calendar github.com renders on the profile page, so it works with no setup.
//
// Always answers 200. Like the now-playing sticker, the chart is decoration:
// on failure it gets {days:[]} and simply doesn't render.

const USER='THEpranavsomalraju';
const GQL='https://api.github.com/graphql';
const PAGE=`https://github.com/users/${USER}/contributions`;

async function viaGraphQL(token){
  const query=`query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{
    weeks{contributionDays{date contributionCount}}}}}}`;
  const r=await fetch(GQL,{
    method:'POST',
    headers:{authorization:'bearer '+token,'content-type':'application/json','user-agent':USER+'-site'},
    body:JSON.stringify({query,variables:{login:USER}})
  });
  if(!r.ok)throw new Error('graphql '+r.status);
  const j=await r.json();
  const weeks=j&&j.data&&j.data.user&&j.data.user.contributionsCollection.contributionCalendar.weeks;
  if(!weeks)throw new Error('graphql: no calendar');
  return weeks.flatMap(w=>w.contributionDays.map(d=>({date:d.date,count:d.contributionCount})));
}

// The profile calendar is a table of <td data-date id=…> cells, each labelled
// by a <tool-tip for=…> reading "N contributions on …" or "No contributions …".
async function viaPage(){
  const r=await fetch(PAGE,{headers:{'user-agent':USER+'-site','x-requested-with':'XMLHttpRequest'}});
  if(!r.ok)throw new Error('page '+r.status);
  const html=await r.text();
  const dateOf=new Map();
  for(const m of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*?\bid="([^"]+)"|\bid="([^"]+)"[^>]*?data-date="(\d{4}-\d{2}-\d{2})"/g)){
    if(m[1])dateOf.set(m[2],m[1]);else dateOf.set(m[3],m[4]);
  }
  const days=[];
  for(const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)){
    const date=dateOf.get(m[1]);if(!date)continue;
    const n=/^\s*([\d,]+)\s+contribution/.exec(m[2]);
    days.push({date,count:n?+n[1].replace(/,/g,''):0});
  }
  if(!days.length)throw new Error('page: no calendar found');
  return days.sort((a,b)=>a.date<b.date?-1:1);
}

module.exports=async function handler(req,res){
  let days=[],source='none';
  try{
    if(process.env.GITHUB_TOKEN){
      try{days=await viaGraphQL(process.env.GITHUB_TOKEN);source='graphql'}
      catch(err){console.error('contributions:',err.message)}
    }
    if(!days.length){days=await viaPage();source='page'}
  }catch(err){
    console.error('contributions:',err.message);
  }
  // fresh enough to feel live, without asking GitHub on every visit
  res.setHeader('cache-control','public, max-age=0, s-maxage=600, stale-while-revalidate=3600');
  res.status(200).json({user:USER,source,days});
};
