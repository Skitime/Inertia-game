window.INERTIA_LEVELS = [
  {
    title: "First Motion",
    lesson: "One cube. One goal.",
    par: 1,
    walls: [],
    goals: [[2,4]],
    pieces: [{id:"red",color:"red",r:2,c:0}]
  },
  {
    title: "The Stop",
    lesson: "A wall can stop a moving cube.",
    par: 1,
    walls: [[0,3]],
    goals: [[0,2]],
    pieces: [{id:"red",color:"red",r:0,c:0}]
  },
  {
    title: "Use the Blocker",
    lesson: "A cube can stop another cube.",
    par: 4,
    walls: [[2,0]],
    goals: [[0,0],[3,0]],
    pieces: [
      {id:"red",color:"red",r:2,c:4},
      {id:"blue",color:"blue",r:0,c:3}
    ]
  },
  {
    title: "Order Matters",
    lesson: "Plan which cube becomes the blocker.",
    par: 8,
    walls: [[0,1],[1,2],[0,4],[4,3]],
    goals: [[4,4],[4,0],[3,3]],
    pieces: [
      {id:"red",color:"red",r:0,c:3},
      {id:"blue",color:"blue",r:2,c:4},
      {id:"green",color:"green",r:2,c:2}
    ]
  }
];
