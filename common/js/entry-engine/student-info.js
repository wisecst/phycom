/* Student attribution is shared by works, projects and task examples.
 * Source and Preview preserve exact verified identities. Only student distribution anonymizes.
 * Missing identities must never be guessed. */
(()=>{'use strict';const E=window.EntryEngine;
E.studentInfo={format({year=2026,school='수남중',number,name},target='source'){
if(!/^\d{5}$/.test(String(number))||!name||name.includes('OO'))throw Error('정확한 학번과 이름이 필요합니다.');
if(target==='student')return `${year}학년도 ${school} 1학년 ${name[0]}OO`;
if(!['source','preview'].includes(target))throw Error('Unknown student information target');
return `${year}학년도 ${school} ${number} ${name}`;
}};
})();
