const ACHIEVEMENTS = [
    {
        type: 0,
        title: `Thanks for coding!`,
        description: [
            `Run the code for the first time.`,
        ],
    },{
        type: 0,
        title: `To infinity and beyond`,
        description: [
            `Complete the game for the first time.`,
            `Reach P = 2<sup>2<sup>1024</sup></sup> (${format(Decimal.pow(2,Number.MAX_VALUE), true)}).`,
        ],
    },{
        type: 0,
        title: `Legendary Steak!`,
        description: [
            `Have a legendary reward.`,
        ],
    },{
        type: 0,
        title: `Infinity Variables`,
        description: [
            `Have 6 unique variables.`,
        ],
    },{
        type: 0,
        title: `I am speed`,
        description: [
            `Complete the game with at most 20 loops.`,
            `Complete the game with at most 10 loops.`,
            `Complete the game with at most 5 loops.`,
        ],
    },{
        type: 0,
        title: `Code Golf`,
        description: [
            `Make infinity with only one line of code.`,
            `Complete the game without inserting any lines of code.`,
        ],
    },{
        type: 0,
        title: `Over-goal!`,
        description: [
            `Complete the game where you beat any goals EVERY ONE CONSECUTIVE LOOP.`,
        ],
    },{
        type: 0,
        title: `Superexponential Inflation`,
        description: [
            `Make the current points greater than squared points for goal (at least ${format(1e10)} of points for goal).`,
        ],
    },

    {
        type: 1,
        title: `I'm so free`,
        description: [
            `Make me freedom.`,
            `Click this achievement.`
        ],
    },{
        type: 1,
        title: `I'm so paid`,
        description: [
            `Ignore it later.`,
            `Click the previous achievement 100 times.`
        ],
    },{
        type: 1,
        title: `Déjà Vu`,
        description: [
            `Did you realize about the recursion?`,
            `Make many operators in a line of code.`
        ],
    },{
        type: 1,
        title: `I ain't reading allat`,
        description: [
            `Quit messing things around!`,
            `Insert as many lines as possible in code.`
        ],
    },{
        type: 1,
        title: `Uncanny Cookie`,
        description: [
            `Do you like Cookie Clicker?`,
            `Run 100 times without completing the goal.`
        ],
    },{
        type: 1,
        title: `Skill issue`,
        description: [
            `You are experiencing the progress, aren't you?`,
            `Make the code set the points to zero.`
        ],
    },{
        type: 1,
        title: `Edge of Knife`,
        description: [
            `Do you want to leave the running game right now?`,
            `Press the "Give Up?" button, then the "No" button, while almost completing the game.`
        ],
    },{
        type: 1,
        title: `Long Partnership`,
        description: [
            `It's been 87 years...`,
            `Trigger at least 100 lines in one line. (The code shouldn't contain 100 lines.)`
        ],
    },

    {
        type: 0,
        title: `no rolls?`,
        description: [
            `Complete the game without rerolling rewards.`,
        ],
    },{
        type: 0,
        title: `Be careful with it...`,
        description: [
            `Complete the game with at least 10 goals achieved.`,
            `Complete the game with at least 20 goals achieved.`,
        ],
    },
]

const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.reduce((a,b) => a + (b.description.length - b.type), 0)
const ACH_ORDER = [0,1,2,3,4,5,6,7,16,17,8,9,10,11,12,13,14,15]

const ACHIEVEMENT_CONDITIONS = {
    G5: true,
    6: true,
    16: true,
}

function unlockAchievement(i,j=1) {
    if (j > player.achievements[i]) {
        player.achievements[i] = j;

        const a = document.getElementById('achievement-popups'), A = ACHIEVEMENTS[i];

        const p = document.createElement('div')
        p.className = `o-achievement-div ` + ['','unlocked','golden','platinum'][j]
        p.innerHTML = `
        <img src="textures/achievement${i}.png">
        <div class="o-achievement-title">${i > 7 ? "Secret " : ["","Golden ","Platinum "][j-1] }Achievement Unlocked: ${A.title}</div>
        <div class="o-achievement-description">${A.description[j-1+A.type]}</div>
        `

        a.appendChild(p)
        p.animate({ height: ['0px','100px'] }, { duration: 500, easing: "ease-out" })

        setTimeout(() => {
            p.animate({ height: ['100px','0px'] }, { duration: 500, easing: "ease-out" })

            setTimeout(() => p.remove(), 500)
        }, 3000);

        save()
    }
}

var testtest = 0
function test(i) {
    if (i === 8) {
        testtest++
        if (testtest >= 1) unlockAchievement(8);
        if (testtest >= 100) unlockAchievement(9);
    }
}