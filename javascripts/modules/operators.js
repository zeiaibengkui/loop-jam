const SlotType = {
    Operator: 1 << 0,
    Variable: 1 << 1,
    Constant: 1 << 2,
}

class Variable {
    constructor (id) {
        this.id = id;
    }

    get value () { return player.variables[this.id] ?? 0 }
    set value (n) { player.variables[this.id] = n }

    get description() { return `The "${this.id}" variable. It can be defined, changed, and used for operators.` }

    equals(n) { return this.id === n.id }

    component = "variable"
    sType = SlotType.Variable
}

class Constant {
    constructor (n) {
        this.value = n;
    }

    get description() { return `The value of ${this.value}.` }

    equals(n) { return this.value === n.value }

    component = "constant"
    sType = SlotType.Constant
}

class Slot {
    constructor (allowed = 0, slot = null, locked = false) {
        this.locked = locked;
        this.allowed = allowed;
        /**
         * 0 - Allows ALL
         * 001 (1) - Allows only Operator
         * 010 (2) - Allows only Variable
         * 100 (4) - Allows only Constant
         */
        this.slot = slot;
    }

    get type() {
        if (this.slot instanceof Operator) return SlotType.Operator
        else if (this.slot instanceof Variable) return SlotType.Variable
        else if (this.slot instanceof Constant) return SlotType.Constant
        else return 0;
    }

    calculate() {
        if (this.slot instanceof Operator) return this.slot.run();
        else if (this.slot instanceof Variable) return this.slot.value;
        else if (this.slot instanceof Constant) return this.slot.value;
        else return 0;
    }
}

const OperatorType = {
    SetVariable: 0,
    AddVariable: 1,
    MultVariable: 2,

    Sum: 10,
    Product: 11,
    Exponent: 12,
    Logarithm: 13,

    Repeat: 20,
    EndRepeat: 21,
}

const OperatorHTMLs = {
    [OperatorType.SetVariable]: [undefined,`<img src="./textures/operator-arrow.png" draggable="false">`],
    [OperatorType.AddVariable]: [undefined,`<img src="./textures/operator-arrow.png" draggable="false"><img src="./textures/operator-addition.png" draggable="false">`],
    [OperatorType.MultVariable]: [undefined,`<img src="./textures/operator-arrow.png" draggable="false"><img src="./textures/operator-multiplication.png" draggable="false">`],

    [OperatorType.Sum]: [undefined,`<img src="./textures/operator-addition.png" draggable="false">`],
    [OperatorType.Product]: [undefined,`<img src="./textures/operator-multiplication.png" draggable="false">`],
    [OperatorType.Exponent]: [undefined,`<img src="./textures/operator-exponent.png" draggable="false">`],
    [OperatorType.Logarithm]: ['ln(',`+1)`],

    [OperatorType.Repeat]: ['Repeat⠀',`⠀times`],
    [OperatorType.EndRepeat]: ['End'],
}

const OperatorDescriptions = {
    [OperatorType.SetVariable]: `Sets a variable to a depending number or operator.`,
    [OperatorType.AddVariable]: `Increases a variable by a depending number or operator.`,
    [OperatorType.MultVariable]: `Multiplies a variable by a depending number or operator.`,

    [OperatorType.Sum]: `Calculates the sum of variables, numbers, and/or operators.`,
    [OperatorType.Product]: `Calculates the product of variables, numbers, and/or operators.`,
    [OperatorType.Exponent]: `Calculates the exponentiation with the base and an exponent.`,
    [OperatorType.Logarithm]: `Calculates the natural logarithm of a variable, number, or operator.`,

    [OperatorType.Repeat]: `Repeats times that calculate inside the repeat loop.`,
}

class Operator {
    component = "operator"
    sType = SlotType.Operator

    persist = false;

    constructor (type, ...slots) {
        this.type = type

        switch (type) {
            case OperatorType.SetVariable:
            case OperatorType.AddVariable:
            case OperatorType.MultVariable:
                this.slots = [new Slot(SlotType.Variable), new Slot()];
            break;
            case OperatorType.Sum:
            case OperatorType.Product:
            case OperatorType.Exponent:
                this.slots = [new Slot(), new Slot()];
            break;
            case OperatorType.EndRepeat:
                this.slots = []
            break;
            default:
                this.slots = [new Slot()];
            break;
        }

        for (let i = 0; i < slots.length; i++) if (slots[i] !== null) {
            if (slots[i] instanceof Slot) this.slots[i] = slots[i];
            else this.slots[i].slot = slots[i];
        }
    }

    run(index=-1) {
        var result = 0;

        switch (this.type) {
            case OperatorType.SetVariable: {
                let c = this.slots[1].calculate();
                result = this.slots[0].slot.value = D(c);
                break;
            }
            case OperatorType.AddVariable: {
                let c = this.slots[1].calculate();
                result = this.slots[0].slot.value = Decimal.add(this.slots[0].slot.value, c);
                break;
            }
            case OperatorType.MultVariable: {
                let c = this.slots[1].calculate();
                result = this.slots[0].slot.value = Decimal.mul(this.slots[0].slot.value, c);
                break;
            }

            case OperatorType.Sum:
                result = Decimal.add(this.slots[0].calculate(),this.slots[1].calculate());
            break;
            case OperatorType.Product:
                result = Decimal.mul(this.slots[0].calculate(),this.slots[1].calculate());
            break;
            case OperatorType.Exponent:
                result = Decimal.pow(this.slots[0].calculate(),this.slots[1].calculate());
            break;
            case OperatorType.Logarithm:
                result = Decimal.add(this.slots[0].calculate(),1).ln();
            break;

            case OperatorType.Repeat: {
                const temp = []
                let depth = 1
                for (let i = index+1; i < player.code.length; i++) {
                    const c = player.code[i]

                    if (depth === 1 && c.type !== OperatorType.EndRepeat) {
                        temp.push(() => c.run(i))
                    };

                    if (c.type === OperatorType.Repeat) depth++;
                    else if (c.type === OperatorType.EndRepeat) depth--;

                    if (depth === 0) break;
                }
                for (let i = 0; i < this.slots[0].calculate(); i++) temp.forEach(x => x());
                break;
            }
        }

        return result;
    }

    get description() { return findDescription(this) ?? OperatorDescriptions[this.type] }

    equals(o) {
        if (this.type !== o.type) return false;

        for (let i = 0; i < this.slots.length; i++) {
            const s1 = this.slots[i], s2 = o.slots[i];

            if (s1.allowed !== s2.allowed) return false;

            if (s1.locked !== s2.locked) return false;
            else if (s1.locked) {
                if (s1.type !== s2.type) return false;

                if (!s1.slot.equals(s2.slot)) return false;
            }
        }

        return true;
    }

    static clearCode(index) {
        if (player.tutorials || player.running) return;

        const c = player.code[index]

        if (c.persist) return;

        const T = c.type === OperatorType.Repeat

        splitCode(c)
        player.code.splice(index,1)

        if (T) {
            let depth = 1
            for (let i = index; i < player.code.length-1; i++) {
                const cc = player.code[i]
                if (cc.type === 20) depth++;
                else if (cc.type === 21) depth--
                if (depth === 0) {
                    player.code.splice(i,1)
                    break;
                };
            }
        }
    }
    static insertCode(index,code) {
        if (player.running || !(code instanceof Operator) || player.slots.get(code) <= 0) return;

        if (player.tutorials === 2) {
            message(`Good job! Second, click the "a" VARIABLE.`,2)
            player.tutorials++
        }

        increaseSlot(code,-1)
        player.code.splice(index,0,_.cloneDeep(code))

        if (code.type === OperatorType.Repeat) {
            const o = new Operator(OperatorType.EndRepeat)
            o.persist = true;
            player.code.splice(index+1,0,o)
        }

        if (player.slots.get(player.choosed_slot) === 0) player.choosed_slot = null;

        ACHIEVEMENT_CONDITIONS.G5 = false;
        if (player.code.length >= 32) unlockAchievement(11);
    }
}

const CustomOperatorDescriptions = new Map([
    [new Operator(OperatorType.Exponent, null, new Slot(0, new Constant(2), true)), `Calculate the square of a variable, number, or operator.`],
    [new Operator(OperatorType.Exponent, null, new Slot(0, new Constant(3), true)), `Calculate the cube of a variable, number, or operator.`],
    [new Operator(OperatorType.Exponent, null, new Slot(0, new Operator(OperatorType.Logarithm, new Slot(0, new Operator(OperatorType.Logarithm), true)), true)), `${OperatorDescriptions[OperatorType.Exponent]} The exponent equals to natural logarithm of a variable, number, or operator. <i>[ln(ln(5+1)+1) > 1]</i>`],
])
function findDescription(c) {
    for (const [o,d] of CustomOperatorDescriptions) if (equalAll(c,o)) return d;
    
    return null
}

function chooseInventorySlot(s) {
    if (player.tutorials === 1 && !equalAll(s, new Operator(OperatorType.SetVariable, new Slot(2, new Variable('a'), true), new Slot(0, new Constant(1), true)))
        || player.tutorials === 2
        || player.tutorials === 3 && !equalAll(s, new Variable("a"))
        || player.tutorials === 4
        || player.tutorials === 5
        || player.running || player.slots.get(s) <= 0) return;
    if (player.tutorials === 1) {
        message(`Good! Then insert that operator into a new line, clicking [+].`,2)
        player.tutorials++
    } else if (player.tutorials === 3) {
        message(`Then place the empty slot in the operator in the last line of the code.`,2)
        player.tutorials++
    }

    if (player.choosed_slot && equalAll(player.choosed_slot, s)) player.choosed_slot = null
    else {
        player.choosed_slot = null
        player.choosed_slot = s
    }
}

const D = x => new Decimal(x);

var player

function format(n, force = false) {
    const DN = D(n)
    if (!force && !player?.endless && DN.gt(Number.MAX_VALUE)) return "Infinite";
    else if (DN.lt(1e9)) return DN.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    else {
        const e = DN.log10().floor();
        return (e.lt(1e9) ? DN.div(e.pow10()).toFixed(3) + "x" : "") + `10<sup>${format(e)}</sup>`
    }
}