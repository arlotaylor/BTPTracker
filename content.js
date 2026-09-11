const overlay = document.createElement('div');
overlay.id = 'achievement-overlay';
overlay.innerHTML = `
    <h3>All Achievements</h3>
    <div id="achievement-grid">
        <table>
            <tr>
                <th id=ach-cell-0> <img src="images/ach_5rounds-sheet0.png" /> <span> 0/5 </span> </th>
                <th id=ach-cell-1> <img src="images/ach_10rounds-sheet0.png" /> <span> 0/10 </span> </th>
                <th id=ach-cell-2> <img src="images/ach_20rounds-sheet0.png" /> <span> 0/20 </span> </th>
                <th id=ach-cell-3> <img src="images/ach_25pigs-sheet0.png" /> <span> 0/25 </span> </th>
            </tr>
            <tr>
                <th id=ach-cell-4> <img src="images/ach_100pigs-sheet0.png" /> <span> 0/100 </span> </th>
                <th id=ach-cell-5> <img src="images/ach_imprisoner-sheet0.png" /> <span> Jail </span> </th>
                <th id=ach-cell-6> <img src="images/ach_pursuer-sheet0.png" /> <span> Chase </span> </th>
                <th id=ach-cell-7> <img src="images/ach_builder-sheet0.png" /> <span> Build </span> </th>
            </tr>
        </table>
    </div>
    <div id="timer-div">
        <button id="reset-button"> Reset </button>
        <span id="speedrun-timer"> Timer Interrupted </span>
    </div>
`;
document.body.appendChild(overlay);

const statsContainer = document.getElementById('overlay-stats');
let lastStats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const iconCells = [
    document.getElementById('ach-cell-0'),
    document.getElementById('ach-cell-1'),
    document.getElementById('ach-cell-2'),
    document.getElementById('ach-cell-3'),
    document.getElementById('ach-cell-4'),
    document.getElementById('ach-cell-5'),
    document.getElementById('ach-cell-6'),
    document.getElementById('ach-cell-7')
];

const statNames = [
    'ach_5rounds', 'ach_10rounds', 'ach_20rounds', 'ach_25pigs',
    'ach_100pigs', 'ach_imprisoner', 'ach_pursuer', 'ach_builder',
    'maxround', 'pig_count', 'TutorialShown'
]

function fetchStats()
{
    let ret = false;
    for (let i = 0; i < 11; i++)
    {
        const data = localStorage.getItem('btp_' + statNames[i]);
        if (data !== null)
        {
            const numDat = Number(data);
            if (lastStats[i] !== numDat)
            {
                lastStats[i] = numDat;
                ret = true;
            }
        }
    }
    return ret;
}

function isGameStarted()
{
    return !(lastStats[0] === 0 && lastStats[1] === 0 && lastStats[2] === 0 && lastStats[3] === 0
        && lastStats[4] === 0 && lastStats[5] === 0 && lastStats[6] === 0 && lastStats[7] === 0
        && lastStats[8] === 0 && lastStats[9] === 0);  // is everything zero (except tutorial)
}
function isGameFinished()
{
    return lastStats[0] === 1 && lastStats[1] === 1 && lastStats[2] === 1 && lastStats[3] === 1
        && lastStats[4] === 1 && lastStats[5] === 1 && lastStats[6] === 1 && lastStats[7] === 1
}

function updateIcons()
{
    for (let i = 0; i < 8; i++)
    {
        if (lastStats[i] === 0)
        {
            iconCells[i].children[0].src = "images/achievementlocked-sheet0.png";
            iconCells[i].children[1].style.color = "#ffffff";
        }
        else
        {
            iconCells[i].children[0].src = "images/" + statNames[i] + "-sheet0.png";
            iconCells[i].children[1].style.color = "#00ff00";
        }
    }

    iconCells[0].children[1].textContent = ` ${lastStats[0] === 0 ? Math.max(lastStats[8]-1,0) : 5}/5 `;
    iconCells[1].children[1].textContent = ` ${lastStats[1] === 0 ? Math.max(lastStats[8]-1,0) : 10}/10 `;
    iconCells[2].children[1].textContent = ` ${lastStats[2] === 0 ? Math.max(lastStats[8]-1,0) : 20}/20 `;
    iconCells[3].children[1].textContent = ` ${Math.min(lastStats[9], 25)}/25 `;
    iconCells[4].children[1].textContent = ` ${Math.min(lastStats[9], 100)}/100 `;
}

function resetGame()
{
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
}

function formatTime(ms)
{
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);

    const pad = (num, size) => num.toString().padStart(size, '0');

    if (hours !== 0)
    {
        return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(milliseconds, 3)}`;
    }
    else if (minutes !== 0)
    {
        return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(milliseconds, 3)}`;
    }
    else
    {
        return `${pad(seconds, 2)}.${pad(milliseconds, 3)}`;
    }
}

document.getElementById("reset-button").addEventListener("click", resetGame);

fetchStats();
updateIcons();

const willTime = !isGameStarted();
let hasStartedTiming = false;
let hasFinishedTiming = false;
let startTime = 0;
let finishTime = 0;

const speedrunTimer = document.getElementById('speedrun-timer');

if (willTime)
{
    speedrunTimer.textContent = " Waiting To Start ";
}

// 3. Loop to check Local Storage data
setInterval(() => {
    if (fetchStats())
    {
        updateIcons();

        if (!willTime)
        {
            // timing is not needed
        }
        else if (!hasStartedTiming && lastStats[10] === 1)  // starting the timer
        {
            startTime = performance.now();
            hasStartedTiming = true;
        }
        else if (!hasFinishedTiming && isGameFinished())
        {
            finishTime = performance.now();
            hasFinishedTiming = true;
            speedrunTimer.textContent = formatTime(finishTime-startTime);
            speedrunTimer.style.color = "#00ff00";
        }
    }
    if (hasStartedTiming && !hasFinishedTiming)
    {
        speedrunTimer.textContent = formatTime(performance.now()-startTime);
    }
}, 16);

