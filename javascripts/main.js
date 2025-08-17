const getPlayerData = function () {
    const data = {
        msg: "Hello, World!",

        playing: false,
        storing: false,
        running: false,

        variables: {
            P: D(0),
        },
        new_variables: new Set(["P","a"]),

        nextP: D(1),
        completed: false,
        level: 1,

        slots: new Map([
            [new Operator(OperatorType.SetVariable, new Slot(2, new Variable('a'), true), new Slot(0, new Constant(1), true)), 1],
            [new Variable('a'), 3],

            // [new Operator(20, new Slot(4, new Constant(3), true)),3]
        ]),
        stored: [],
        chose_slot: null,
        chose_store: null,

        code: [
            new Operator(OperatorType.AddVariable, new Slot(0, new Variable('P'), true)),
        ],
        loops: 0,

        rewards: [],
        reroll: 5,
        choseRewards: new Set(),

        popup: {
            enabled: false,
            msg: "",
            component: null,
            buttons: [["Ok"]],
        },

        mute: false,
        tutorial: true,

        tutorials: 0,

        achievements: new Array(ACHIEVEMENTS.length).fill(0),

        endless: false,
    }

    data.code[0].persist = true;

    return data
}

player = reactive(getPlayerData())

const GameLoad = function () {
    // player.rewards = calculateRewards()

    const str = localStorage.getItem('loop-jam-save')

    if (str) {
        const loaded = JSON.parse(atob(str))

        player.tutorial = loaded.tutorial
        player.mute = loaded.mute
        player.achievements = loaded.achievements

        for (let i = 0; i < ACHIEVEMENTS.length; i++) player.achievements[i] ??= 0;
    }

    buildVue()

    setTimeout(()=>{
        document.getElementById('app').style.display = "";

        setInterval(save,1000)
    },1)
}

function startGame() {
    player.playing = true;
    player.stored = [];
    player.storing = false;
    player.variables = {
        P: D(0),
    }
    player.new_variables = new Set(["P","a"])
    player.nextP = D(1)
    player.slots = new Map([
        [new Operator(OperatorType.SetVariable, new Slot(2, new Variable('a'), true), new Slot(0, new Constant(1), true)), 1],
        [new Variable('a'), 3],

        
        
        /*
        [new Operator(OperatorType.Exponent, null, new Slot(0, new Operator(OperatorType.Logarithm, new Slot(0, new Operator(OperatorType.Logarithm), true)), true)), 1]
        [new Operator(10), 128],
        [new Operator(0), 20],
        [new Operator(20, new Slot(4, new Constant(3), true)),3]
        [new Variable('f'), 10],
        [new Variable('c'), 10],
        [new Variable('b'), 10],
        [new Constant(1), 10],
        */
    ])
    player.chose_slot = null;
    player.chose_store = null;
    player.code = [
        new Operator(OperatorType.AddVariable, new Slot(0, new Variable('P'), true)),
    ]
    player.code[0].persist = true;
    player.loops = 0;
    player.level = 1;
    for (const id in ACHIEVEMENT_CONDITIONS) ACHIEVEMENT_CONDITIONS[id] = true;
    player.tutorials = +player.tutorial
    if (player.tutorial) message(`Hello, it's me, processor! Oh you need a tutorial? Yes, here I teach you! Firstly, click the OPERATOR, which is here in inventory, including operators, variables, and constants. There are three "a" variables and one operator, which sets the "a" variable.`,2);
    else message(`Welcome to the 2<sup>1024</sup> Loops! Build the code and reach the goal and P = 2<sup>1024</sup> (${format(Number.MAX_VALUE)}). Good luck!`,2);
    player.endless = false;
}

function save() {
    localStorage.setItem("loop-jam-save",btoa(JSON.stringify({
        achievements: player.achievements,
        mute: player.mute,
        tutorial: player.tutorial,
    })))
}

function increaseSlot(s, value) {
    for (const [k,v] of player.slots) if (k.equals(s)) {
        player.slots.set(k,Math.max(v+value,0))
        return
    }
    player.slots.set(s, value)
}

function splitCode(c, override=true) {
    let temp = [_.cloneDeep(c)], new_temp = [], result = []

    const r = o => {
        for (let i = 0; i < o.slots.length; i++) {
            const s = o.slots[i]

            if (s.locked) {
                if (s.slot instanceof Operator) r(s.slot);
            } else if (s.slot) {
                new_temp.push(s.slot);
                s.slot = null;
            }
        }
    }

    while (temp.length) {
        new_temp = []

        temp.forEach(t => {
            if (t instanceof Operator) r(t);
            if (override) increaseSlot(t,1);
            result.push(t);
        })

        temp = new_temp;
    }

    // console.log(result)

    return result
}

(() => {
    var index, step, interval, spam = 0;

    function finish() {
        if (step?.length >= 100) unlockAchievement(15);
        if (player.variables.P.gte(Decimal.pow(2,Number.MAX_VALUE))) unlockAchievement(1,2);
        player.running = false;

        if (player.tutorials === 5) {
            player.tutorials = 0;
            player.tutorial = false;

            createComponentPopup("tutorial1",[["Next",()=>createComponentPopup("tutorial2",[["Thanks!",()=>finish()]])]])
        } else if (player.variables.P.gte(player.nextP)) {
            spam = 0

            if (player.endless || player.variables.P.lt(Number.MAX_VALUE)) {
                if (player.variables.P.gte(player.nextP.sqr()) && player.nextP.gte(1e10)) unlockAchievement(7);

                player.completed = true
                player.rewards = calculateRewards()
                player.reroll = 3
                unlockAchievement(0)

                if (player.variables.P.div(player.nextP).gte(1e10)) message(`What a BIG one! We're almost at the infinity point!`,2);
                else message(`Good job, looper! Consider keeping going so far.`,2);
            } else {
                unlockAchievement(1)

                if (player.loops <= 20) unlockAchievement(4);
                if (player.loops <= 10) unlockAchievement(4,2);
                if (player.loops <= 5) unlockAchievement(4,3);
                if (player.code.length === 1) unlockAchievement(5);
                if (ACHIEVEMENT_CONDITIONS.G5) unlockAchievement(5,2);
                if (ACHIEVEMENT_CONDITIONS[6]) unlockAchievement(6);
                if (ACHIEVEMENT_CONDITIONS[16]) unlockAchievement(16);
                if (player.level >= 10) unlockAchievement(17,1);
                if (player.level >= 20) unlockAchievement(17,2);

                message(`Congratulations for reaching the infinity! Come back to play again! :)`,2);
                createPopup(`<h2>Game Completed!</h2>Congratulations for reaching P = 2<sup>1024</sup> (${format(Number.MAX_VALUE)})! You can play the game again for challenging achievements!<br>If you want to continue playing, you can enter Endless Mode, which "breaks infinity," but the goal is raised significantly.`,[
                    ['Enter Endless Mode',()=>{
                        player.endless = true
                        player.completed = true
                        player.rewards = calculateRewards()
                        player.reroll = 3
                        message(`OH! You want to handle big numbers? Of course, you can do it, but you must have to reach significant goal! Good luck, looper...`,2);
                    }],
                    ['Play Again',startGame],
                    ['Back to Main Menu',()=>player.playing=false]
                ])

                save()
            }
        } else {
            spam++
            ACHIEVEMENT_CONDITIONS[6] = false

            if (player.variables.P.eq(0) && player.nextP.gt(1)) {
                message(`Why did you set that point to ZERO??? What a skill issue...`,4)
                unlockAchievement(13)
            } else if (spam >= 100) {
                message(`...`,3)
                unlockAchievement(12)
            } else message([
                `Consider optimizing the code for a bigger gain!`,
                `Don't spam the "Play" button like in "Cookie Clicker"!`,
                `Keep going to improve!`,
            ][Math.floor(3 * Math.random())],0);
        }
    }

    window.runCode = function () {
        if (player.tutorial && player.tutorials < 5 || player.completed || player.popup.enabled) return;

        if (player.running) {
            clearInterval(interval)

            for (let i = index; i < step.length; i++) step[i][1]?.();

            finish()

            return
        }

        // Checking Syntax

        // var no_insert_p = true
        // const ex = new Operator(1, new Slot(0, new Variable('P'), true), null)

        const def = {
            P: true,
        }

        const check = x => {
            if (x instanceof Operator) {
                if (x.type < 10) {
                    if (check(x.slots[1].slot)) return true;
                    else if (!x.slots[0].slot || x.type !== OperatorType.SetVariable && !def[x.slots[0].slot.id]) return true;

                    def[x.slots[0].slot.id] = true;
                }
                else for (let i = 0; i < x.slots.length; i++) if (check(x.slots[i].slot)) return true;
            }
            else if (x instanceof Variable && !def[x.id]) return true;

            return false
        }

        for (let i = 0; i < player.code.length; i++) {
            const c = player.code[i]
            // if (no_insert_p && splitCode(c, false).some(s => s instanceof Operator && s.equals(ex))) no_insert_p = false;
            if (check(c)) {
                message(`Error is found at line ${i+1} of the code! Please fix it before the rerun.`,1)
                return
            }
        }

        message(``,0)

        player.chose_slot = null;
        player.chose_store = null;
        player.storing = false;
        player.running = true;
        player.loops++;

        player.new_variables.forEach(i => {if (i !== 'P') player.variables[i] = D(0)});

        /*
        let depth = 0;

        for (let i = 0; i < player.code.length; i++) {
            const c = player.code[i]

            if (depth === 0) c.run(i);

            if (c.type === OperatorType.Repeat) depth++;
            else if (c.type === OperatorType.EndRepeat) depth--;
        }
        */

        let depth = 0, repeats = [], saved = [];
        step = [];

        for (let i = 0; i < player.code.length; i++) {
            const c = player.code[i]

            // console.log(i, repeats[depth])

            // if (depth === 0) c.run(i);

            if (c.type === OperatorType.Repeat) {
                depth++
                repeats[depth] = c.slots[0].calculate()
                saved[depth] = i

                step.push([i])
            }
            else if (c.type === OperatorType.EndRepeat) {
                repeats[depth]--
                if (repeats[depth]) i = saved[depth];
                else depth--;
            }
            else step.push([i, () => c.run(i)]);
        }

        const lines = document.querySelector('.o-code').children, animation = [
            {
                transform: ['translateX(25px)','translate(0px)'],
            },{
                duration: 250,
                iteration: 1,
                easing: "ease-out",
            },
        ], audio = document.getElementById('type-sound')

        index = 0;
        const f = () => {
            const [j, g] = step[index]

            g?.();
            lines[j].firstChild.animate(...animation)
            if (!player.muted) audio.play();

            index++
            if (step.length > index) interval = setTimeout(f, 1000/(2+.1*index));
            else interval = setTimeout(() => {
                finish()
            }, 1000)
        }

        interval = setTimeout(f,500)

        // step.forEach(x => x[1]?.());

        /*
        if (player.variables.P >= player.nextP) {
            player.completed = true
            player.rewards = calculateRewards()
            player.reroll = 5
        }
        */

        // console.log(player.variables.P)
    }
})()

const randInt = (a,b) => Math.floor(Math.random() * (b - a + 1)) + a;

const equalAll = (a,b) => a?.sType === b?.sType && a.equals(b);

const logBase = (a,b) => Math.log(a) / Math.log(b);

const chooseReward = i => {
    if (player.choseRewards.size < 3 || player.choseRewards.has(i)) player.choseRewards.has(i) ? player.choseRewards.delete(i) : player.choseRewards.add(i);
};

function message(text, id = 0) {
    player.msg = text;
    document.getElementById('face').setAttribute('src',id === 4 ? `textures/face${id}.gif` : `textures/face${id}.png`)
}

function createPopup(text, buttons = [["Ok"]]) {
    player.popup.enabled = true;
    player.popup.msg = text;
    player.popup.buttons = buttons;
}
function createComponentPopup(component, buttons = [["Ok"]]) {
    player.popup.enabled = true;
    player.popup.component = component;
    player.popup.buttons = buttons;
}
function actionPopup(i) {
    player.popup.enabled = false;
    player.popup.component = null;
    player.popup.buttons[i][1]?.();
}

function giveUp() {
    if (player.running || player.completed || player.popup.enabled) return;
    createPopup(`Are you sure you want to give up even if you are feeling unlucky or slow or made a choice mistake?`,[
        [`Yes`, () => {
            player.playing = false;
        }],
        [`No`, () => {
            if (!player.endless && player.variables.P >= Number.MAX_VALUE ** .75) unlockAchievement(14);
        }],
    ])
}