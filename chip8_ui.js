function init_buttons(){

    var hex = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F']

    hex.forEach((item, index) => {
        var btn = document.getElementById("inputBtn_" + item);
        btn.addEventListener("click", () =>{
            console.log("btn" + item + " Pressed!")
        })
    
    })
    
}

init_buttons()