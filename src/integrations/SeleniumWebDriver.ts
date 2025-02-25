import { Builder, By, Capabilities, WebDriver, WebElement, WebElementCondition, logging, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { Logger } from "../util/Logger";
import { Util } from "../util/Util";

export class SeleniumWebDriver {
    private builder: Builder;
    private chromeOptions: Options;

    constructor(headless: boolean = true) {
        this.chromeOptions = new Options();
        this.chromeOptions
            .addArguments("--ignore-certificate-errors")
            .addArguments("--ignore-certificate-errors-spki-list")
            .addArguments("--ignore-ssl-errors")
            .addArguments("--log-level=3");
        
        if (headless === true) {
            this.chromeOptions
                .addArguments("--headless")
                .addArguments("--disable-gpu")
                .addArguments("--no-sandbox");
        }

        this.builder = new Builder()
            .forBrowser("chrome")
            .withCapabilities(Capabilities.chrome())
            .setChromeOptions(this.chromeOptions);

        // logging.getLogger('webdriver.http').setLevel(logging.Level.OFF);
        // logging.getLogger('webdriver.browser').setLevel(logging.Level.OFF);
        // logging.getLogger('webdriver.driver').setLevel(logging.Level.OFF);
    }

    private async removeElementIfPresent(driver: WebDriver, condition: WebElementCondition, wait: number = 5000) {
        try {
            const locatedElement: WebElement = await driver.wait(condition, wait);
            if (locatedElement) {
                Logger.log("Element located.");
                await driver.executeScript("arguments[0].parentNode.removeChild(arguments[0])", locatedElement);
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes("TimeoutError")) {
                Logger.log("Element not found.");
            } else {
                Logger.log(error as string);
            }
        }
    }

    public async getAppletonCamScreen(): Promise<string> {
        const width: number = 1920;
        const height: number = 1080;
        const url: string = `https://api.wetmet.net/widgets/stream/frame.php?ruc=245-02-01&width=${width}&height=${height}`;
        const driver: WebDriver = await this.builder.build();
        let imageData: string = "";
        try {
            await driver.get(url);
            try {
                const condition: WebElementCondition = until.elementLocated(By.css("video"));
                const locatedElement: WebElement = await driver.wait(condition, 5000);
                await driver.wait(until.elementIsVisible(locatedElement), 5000);
                await Util.sleep(2000);
                imageData = await driver.executeScript(async (width: number, height: number) => {
                    const video: HTMLVideoElement = document.querySelector('video') as HTMLVideoElement;
                    const canvas: HTMLCanvasElement = document.createElement('canvas');
                    const context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
                    canvas.width = width; // video.videoWidth;
                    canvas.height = height; // video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    return canvas.toDataURL('image/png');
                }, width, height);
            } catch (error) {
                console.log(error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            await driver.quit();
            return imageData;
        }
    }
}