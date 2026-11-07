// Above this many images, faces are shown smaller so they fit.
const MANY_FACES = 6;

/**
 * Shows the outcome of a roll: die face images, the total and a breakdown.
 */
export class ResultsView {
    constructor({ faces, total, detail }) {
        this.faces = faces;
        this.total = total;
        this.detail = detail;
    }

    show(result, notation) {
        const images = result.rolls.flatMap((roll) =>
            roll.faces().map((face) => this.#createImage(face, roll.critClass)),
        );

        this.faces.replaceChildren(...images);
        this.faces.classList.toggle("many", images.length > MANY_FACES);

        this.#showTotal(result);
        this.detail.textContent = `${notation}: ${result.describe()}`;
    }

    showError(message) {
        this.detail.textContent = message;
    }

    #createImage({ src, alt }, critClass) {
        const img = document.createElement("img");

        img.src = src;
        img.alt = alt;
        img.classList.add("face", "rolling");
        if (critClass) {
            img.classList.add(critClass);
        }

        return img;
    }

    #showTotal(result) {
        this.total.className = "";
        void this.total.offsetWidth; // restart the animation
        this.total.classList.add("rolling");
        if (result.critClass) {
            this.total.classList.add(result.critClass);
        }

        this.total.textContent = result.total;
    }
}
