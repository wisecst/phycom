/* Textbook pp.125–127; topic fields and lighting example confirmed by the author.
   Future group records belong in groups once: {year,grade,classId,number,topic,roles:{producer:[],engineer:[],programmer:[],designer:[]},overview,slidesUrl}.
   Future slide files share one year folder; sort by numeric grade/class/group IDs,
   and zero-pad class/group numbers in names: [피컴프로젝트] 1학년 01반 01조(...).
   Keep every class in the year folder without class subfolders. Future slide sections:
   members/roles, theme/overview (fixed input areas), system design, production,
   self-evaluation/improvements, sharing/presentation. Member order follows roles below.
   No student records, external integration or simulated results are provided. */
(()=>{'use strict';
const schoolYears=[{year:2026,classCount:13}];
window.ProjectActivitiesData={
 schoolYears,
 get years(){return schoolYears.map(item=>item.year);},
 classesForYear(year){const config=schoolYears.find(item=>item.year===Number(year));return config?Array.from({length:config.classCount},(_,i)=>({id:i+1,name:(i+1)+'반'})):[];},
 get classes(){return this.classesForYear(this.years[0]);},
 groups:[],
 roles:[
  {id:'producer',name:'프로듀서',focus:'의사소통 · 협력 · 운영',description:'팀 대표로서 모둠원 간 소통을 촉진하고 팀워크를 강화하며 프로젝트의 전체적인 운영을 책임진다.'},
  {id:'engineer',name:'엔지니어',focus:'입·출력 장치 연결 · 회로',description:'오렌지보드에 입·출력 장치를 연결하여 각 장치가 올바르게 작동하도록 회로를 구성한다.'},
  {id:'programmer',name:'프로그래머',focus:'프로그램 작성 · 오류 수정',description:'프로그램 작성 및 디버깅을 통해 입·출력 장치가 의도한 대로 작동하도록 프로그램을 개발한다.'},
  {id:'designer',name:'디자이너',focus:'작품 외형 · 사용자 인터페이스',description:'작품의 외형을 디자인하고, 사용자 인터페이스를 설계하는 등 프로젝트의 디자인을 담당한다.'}
 ],
 topics:['환경 보호','화재와 안전','사회적 약자 지원','건강 관리','스마트한 학교생활','학습 도우미','반려동물','스마트 홈','생활 편의'],
 evaluation:[
  ['기획 의도','제작 의도에 맞게 작품이 완성되었는가?'],
  ['기술 부문','회로 구성과 알고리즘이 올바르게 구현되었는가?'],
  ['편의성','사용자의 관점에서 작품이 사용하기 편리한가?'],
  ['완성도','작품이 오류 없이 원활하게 실행이 잘 되는가?'],
  ['팀워크','모둠 구성원 간의 협력과 소통이 잘 이루어졌는가?']
 ]
};
})();
