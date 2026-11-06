// Vercel serverless function: my public open-source activity, for the Open
// source tab. Pull requests, issues, comments and reviews, newest first.
//
// Needs GITHUB_TOKEN in the Vercel project settings (a fine-grained token with
// no extra permissions is enough; it only reads public data). There is no
// tokenless fallback on purpose: the public events feed has dropped PR titles,
// merge state and author association, so it can't tell open source from team
// work and would show a list of untitled PR numbers.
//
// What counts as open source is GitHub's own authorAssociation: work on a repo
// where I'm an outsider (NONE, CONTRIBUTOR, FIRST_TIME_CONTRIBUTOR,
// FIRST_TIMER). Repos I own, or am a member of or collaborator on (my own
// projects, team and hackathon repos), are left out without a list to keep.
//
// Always answers 200: {configured:false} with no token, {error:true} if GitHub
// fails, otherwise {repos, items, totals}. The page shows a link to my GitHub
// profile in place of the timeline when it gets no items.

const USER='THEpranavsomalraju';
const GQL='https://api.github.com/graphql';
const OUTSIDE=new Set(['NONE','CONTRIBUTOR','FIRST_TIME_CONTRIBUTOR','FIRST_TIMER']);
const MAX_ITEMS=120;

const REPO='repository{nameWithOwner url stargazerCount isPrivate primaryLanguage{name color}}';
const QUERY=`query($login:String!){user(login:$login){
  pullRequests(last:100){nodes{number title url state merged mergedAt closedAt createdAt isDraft authorAssociation ${REPO}}}
  issues(last:100){nodes{number title url state stateReason createdAt closedAt authorAssociation ${REPO}}}
  issueComments(last:100){nodes{createdAt url authorAssociation body
    pullRequest{id number state merged isDraft}
    issue{id number title url state stateReason ${REPO}}}}
  contributionsCollection{pullRequestReviewContributions(last:50){nodes{pullRequestReview{createdAt url state bodyText authorAssociation
    pullRequest{id number title url state merged isDraft ${REPO}}}}}}
}}`;

// a readable start of a body: whitespace collapsed, cut at a word, at most n
function excerpt(text,n=240){
  const t=String(text||'').replace(/\s+/g,' ').trim();
  if(t.length<=n)return t;
  const cut=t.slice(0,n),sp=cut.lastIndexOf(' ');
  return (sp>n*.6?cut.slice(0,sp):cut).replace(/[\s,.;:]+$/,'')+'…';
}
const prState=p=>p.merged?'merged':p.isDraft&&p.state==='OPEN'?'draft':p.state==='OPEN'?'open':'closed';
const issueState=i=>i.state==='OPEN'?'open':i.stateReason==='NOT_PLANNED'||i.stateReason==='DUPLICATE'?'not_planned':'completed';


// each thread, the way GitHub shows it: who opened it and what they wrote,
// everyone's comments (the latest 30), and the events that changed its state
const PERSON='author{login url avatarUrl(size:64)}';
const SAY=`createdAt lastEditedAt url authorAssociation ${PERSON} body`;
const XREF='... on CrossReferencedEvent{createdAt actor{login} source{__typename ... on PullRequest{number title url repository{nameWithOwner}} ... on Issue{number title url repository{nameWithOwner}}}}';
const THREADS=`query($ids:[ID!]!){nodes(ids:$ids){__typename
  ... on Issue{id url state stateReason ${SAY} comments(last:30){totalCount nodes{${SAY}}}
    timelineItems(last:30,itemTypes:[CLOSED_EVENT,REOPENED_EVENT,CROSS_REFERENCED_EVENT]){nodes{__typename
      ... on ClosedEvent{createdAt actor{login} stateReason} ... on ReopenedEvent{createdAt actor{login}} ${XREF}}}}
  ... on PullRequest{id url state merged isDraft ${SAY} comments(last:30){totalCount nodes{${SAY}}}
    timelineItems(last:30,itemTypes:[CLOSED_EVENT,REOPENED_EVENT,MERGED_EVENT,CROSS_REFERENCED_EVENT]){nodes{__typename
      ... on ClosedEvent{createdAt actor{login}} ... on ReopenedEvent{createdAt actor{login}} ... on MergedEvent{createdAt actor{login}} ${XREF}}}}
}}`;

// markdown as written, trimmed for the page: template comments out, and a long
// body cut at a line (closing any code fence it cut through) with more:true
function md(src,n=900){
  let t=String(src||'').replace(/<!--[\s\S]*?-->/g,'').replace(/\r\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim(),more=false;
  if(t.length>n){
    let cut=t.lastIndexOf('\n',n);if(cut<n*.5)cut=t.lastIndexOf(' ',n);
    t=t.slice(0,cut>0?cut:n).trimEnd();more=true;
    if((t.match(/^\s*```/gm)||[]).length%2)t+='\n```';
  }
  return{md:t,more};
}
const who=a=>a?{login:a.login,url:a.url,avatar:a.avatarUrl}:{login:'ghost',url:'https://github.com/ghost',avatar:null};
async function threadsFor(ids,gql){
  const out={};
  if(!ids.length)return out;
  const j=await gql(THREADS,{ids});
  for(const n of (j.data&&j.data.nodes)||[]){
    if(!n)continue;
    // only today's text exists, so a comment edited since is marked the way GitHub marks it
    const say=c=>Object.assign({at:c.createdAt,url:c.url,role:c.authorAssociation,who:who(c.author),edited:!!c.lastEditedAt},md(c.body));
    const events=n.timelineItems.nodes.map(e=>{
      const base={type:e.__typename.replace('Event','').toLowerCase(),at:e.createdAt,actor:e.actor?e.actor.login:'ghost'};
      if(e.stateReason)base.reason=e.stateReason.toLowerCase();
      if(e.source&&e.source.number)base.ref={num:e.source.number,title:e.source.title,url:e.source.url,
        repo:e.source.repository.nameWithOwner,kind:e.source.__typename==='PullRequest'?'pr':'issue'};
      return base;
    });
    out[n.id]={kind:n.__typename==='PullRequest'?'pr':'issue',url:n.url,
      state:n.__typename==='PullRequest'?prState(n):issueState(n),
      opener:say(n),comments:n.comments.nodes.map(say),total:n.comments.totalCount,events};
  }
  return out;
}

module.exports=async function handler(req,res){
  const token=process.env.GITHUB_TOKEN;
  if(!token){res.status(200).json({configured:false});return}

  try{
    const gql=async(query,variables)=>{
      const r=await fetch(GQL,{method:'POST',
        headers:{authorization:'bearer '+token,'content-type':'application/json','user-agent':USER+'-site'},
        body:JSON.stringify({query,variables})});
      if(!r.ok)throw new Error('graphql '+r.status);
      return r.json();
    };
    const j=await gql(QUERY,{login:USER});
    const u=j&&j.data&&j.data.user;
    if(!u)throw new Error('graphql: '+((j&&j.errors&&j.errors[0]&&j.errors[0].message)||'no user'));

    const repos={};
    const keep=(assoc,repo)=>{
      if(!repo||repo.isPrivate||!OUTSIDE.has(assoc))return false;
      repos[repo.nameWithOwner]=repos[repo.nameWithOwner]||{
        name:repo.nameWithOwner,url:repo.url,stars:repo.stargazerCount,
        lang:repo.primaryLanguage&&repo.primaryLanguage.name||null,color:repo.primaryLanguage&&repo.primaryLanguage.color||null};
      return true;
    };
    const items=[];

    for(const p of u.pullRequests.nodes){
      if(!keep(p.authorAssociation,p.repository))continue;
      items.push({kind:'pr',at:p.createdAt,repo:p.repository.nameWithOwner,num:p.number,title:p.title,url:p.url,
        state:prState(p),mergedAt:p.mergedAt||null});
    }
    for(const i of u.issues.nodes){
      if(!keep(i.authorAssociation,i.repository))continue;
      items.push({kind:'issue',at:i.createdAt,repo:i.repository.nameWithOwner,num:i.number,title:i.title,url:i.url,
        state:issueState(i)});
    }

    // every comment is its own entry, at the moment it was posted: a thread I
    // came back to the next day shows up twice, at both times, as it happened.
    // each carries its own text, in case it's older than the comments fetched
    // with the thread
    const threads=new Map();
    for(const c of u.issueComments.nodes){
      const t=c.issue;
      if(!t||!keep(c.authorAssociation,t.repository))continue;
      const pr=c.pullRequest;
      threads.set(c.url,Object.assign({kind:'comment',at:c.createdAt,repo:t.repository.nameWithOwner,num:t.number,title:t.title,
        url:c.url,threadUrl:t.url,thread:(pr&&pr.id)||t.id,on:pr?'pr':'issue',state:pr?prState(pr):issueState(t),
        role:c.authorAssociation},md(c.body)));
    }
    items.push(...threads.values());

    for(const n of u.contributionsCollection.pullRequestReviewContributions.nodes){
      const rv=n.pullRequestReview,p=rv&&rv.pullRequest;
      if(!p||!keep(rv.authorAssociation,p.repository))continue;
      items.push({kind:'review',at:rv.createdAt,repo:p.repository.nameWithOwner,num:p.number,title:p.title,url:rv.url,
        threadUrl:p.url,thread:p.id,verdict:rv.state.toLowerCase(),state:prState(p)});
    }

    items.sort((a,b)=>a.at<b.at?1:a.at>b.at?-1:0);
    const shown=items.slice(0,MAX_ITEMS);
    const totals={
      prs:items.filter(i=>i.kind==='pr').length,
      merged:items.filter(i=>i.kind==='pr'&&i.state==='merged').length,
      issues:items.filter(i=>i.kind==='issue').length,
      comments:items.filter(i=>i.kind==='comment').length,
      reviews:items.filter(i=>i.kind==='review').length,
      repos:new Set(items.map(i=>i.repo)).size
    };
    const ids=[...new Set(shown.map(i=>i.thread).filter(Boolean))].slice(0,100);
    let threadMap={};
    try{threadMap=await threadsFor(ids,gql)}catch(err){console.error('opensource threads:',err.message)}   // the timeline still stands without them
    const used=new Set(shown.map(i=>i.repo));
    for(const k of Object.keys(repos))if(!used.has(k))delete repos[k];

    // five minutes at the edge, so a new comment shows up soon after it's posted
    res.setHeader('cache-control','public, max-age=0, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json({configured:true,user:USER,repos,items:shown,threads:threadMap,totals});
  }catch(err){
    console.error('opensource:',err.message);
    res.status(200).json({configured:true,error:true});
  }
};
