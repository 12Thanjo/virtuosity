var engine2d;

setEngine2d = function(engine){
    engine2d = engine.expose();
}


Audio = function(key, name){
    this.name = name;
    this.audio = engine2d.add.audio(key);
    engine2d.sound.setDecodedCallback([this.audio], ()=>{}, this);
    this.audio.allowMultiple = false;
    this.alpha = 1;


    this.play = function(){
        if(this.alpha == 1){
            this.audio.play();
        }
    }

    this.stop = function(){
        this.audio.stop();
    }

    this.pause = function(){
        this.audio.pause();
    }

    this.paused = function(){
        return this.audio.paused;
    }

    this.playing = function(){
        return this.audio.isPlaying;
    }

    this.destroy = function(){
        this.audio.stop();
        this.audio.destroy();
    }

    this.alpha = function(alpha){
        this.alpha = alpha;
        if(alpha == 0 && this.audio.isPlaying){
            this.audio.pause();
        }else if(alpha == 1 && this.audio.paused){
            this.audio.play();
        }
    }
}



module.exports = {
    audio: Audio,
    setEngine2d: (engine)=>{
        setEngine2d(engine);
    }
}