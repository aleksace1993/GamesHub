const KEY_CODES = {
    'Escape':0,
    'LeftArrow':0,
    'RightArrow':0,
    'BottomArrow':0,
    'TopArrow':0
};
const Assets = {
    'blueVirus': "Assets/blueVirus.png",
    'redVirus': "Assets/redVirus.png",
    'yellowVirus': "Assets/yellowVirus.png",
    'doctorMario': "Assets/doctorMario.png",
    'explosion': "Assets/pop.png",
}
const GAME_CONFIG = {
   "desiredFPS": 30.0,
   "blockSizeInPixels": 45,
   "bonusGridHeight": 0,
   "virusSpawnOffsetY": 6,
   "pillStartX": 4,
   "pillStartY": 0,
   "pillCornerRadius": 20,
   "gridWidthInBlocks": 8,
   "gridHeightInBlocks": 16,
   "gameGridOffsetX": 300,
   "gameGridOffsetY": 100,
   "windowBorderThickness": 8,
   "gameBackgroundColor": "#245236",
   "gameWindowWidth": 1280,
   "gameWindowHeight": 900,
   "drMarioImageWidth": 400,
   "drMarioImageHeight": 400,
   "drMarioImageCanvasOffsetX": 700,
   "drMarioImageCanvasOffsetY": 300,
   //these are coords in blocks for now, a stupid hack
   "nextPillStartX":10.5,
   "nextPillStartY":6,
   "levelSpeed":{
       "1": 1000,
       "2": 950,
       "3": 900,
       "4": 850,
       "5": 800,
       "6": 750,
       "7": 700,
       "8": 650,
       "9": 600,
       "10": 550,
       "11": 500,
       "12": 450,
       "13": 400,
       "14": 350,
       "15": 300,
       "16": 250,
       "17": 200,
       "18": 150,
   },
   "numVirusesPerLevel":{
        "1": 5,
        "2": 7,
        "3": 9,
        "4": 11,
        "5": 13,
        "6": 15,
        "7": 17,
        "8": 19,
        "9": 21,
        "10": 23,
        "11": 25,
        "12": 27,
        "13": 29,
        "14": 31,
        "15": 33,
   },
   "minPairsForPoints":4,
};
const GameState = {
    "pillSpeedThreshold": 0,
    "pillSpeed": 1000,
    "currentLevel": 1,
    "maxLevels":15,
    "score": 0,
}
function timeStamp(){
    return new Date().getTime();
}
const timing = {
    //Game loop
    "nowTime": 0,
    "lastTime": timeStamp(),
    "dt": timeStamp(),

    //FPS
    "OneSecondTime": 0.0,
    "frameCount": 0,
    "desiredMSPerFrame": 1000.0/GAME_CONFIG.desiredFPS,

    //Block fall
    "blockFallSpeed": 30,
    "blockFallCountdown": 0,
    "FallNowTime": 0,
    "FallLastTime": timeStamp(),
    "dtFall": 0,

    //Todo: PillSpawn for throwing the pill....
    "pillTravelTime" : 500,
    "pillFlyStartTime" : timeStamp(),
    "pillFlyNowTime": 0,
    "pillFlyTimedT": 0,
};