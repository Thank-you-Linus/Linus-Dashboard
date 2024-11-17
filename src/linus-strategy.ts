import { Helper } from "./Helper";
import { generic } from "./types/strategy/generic";
import { LovelaceConfig, LovelaceViewConfig } from "./types/homeassistant/data/lovelace";
import StrategyArea = generic.StrategyArea;
import StrategyFloor = generic.StrategyFloor;
import { AREA_CARDS_DOMAINS, DEVICE_CLASSES } from "./variables";
import { AreaView } from "./views/AreaView";
import { slugify } from "./utils";

/**
 * Mushroom Dashboard Strategy.<br>
 * <br>
 * Mushroom dashboard strategy provides a strategy for Home-Assistant to create a dashboard automatically.<br>
 * The strategy makes use Mushroom and Mini Graph cards to represent your entities.<br>
 * <br>
 * Features:<br>
 *     🛠 Automatically create dashboard with three lines of yaml.<br>
 *     😍 Built-in Views for several standard domains.<br>
 *     🎨 Many options to customize to your needs.<br>
 * <br>
 * Check the [Repository]{@link https://github.com/AalianKhan/linus-strategy} for more information.
 */
class MushroomStrategy extends HTMLTemplateElement {
  /**
   * Generate a dashboard.
   *
   * Called when opening a dashboard.
   *
   * @param {generic.DashBoardInfo} info Dashboard strategy information object.
   * @return {Promise<LovelaceConfig>}
   */
  static async generateDashboard(info: generic.DashBoardInfo): Promise<LovelaceConfig> {
    console.log('info', info)
    await Helper.initialize(info);

    // Create views.
    const views: LovelaceViewConfig[] = info.config?.views ?? [];

    // Create a view for each exposed domain.
    for (let viewId of Helper.getExposedViewIds()) {
      if (AREA_CARDS_DOMAINS.includes(viewId) && (Helper.domains[viewId] ?? []).length === 0) continue
      try {
        let viewModule;
        if ([...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor].includes(viewId)) {
          viewModule = await import("./views/AggregateView");
          const view = new viewModule.AggregateView({ device_class: viewId });
          views.push(await view.getView());
        } else {
          const viewType = Helper.sanitizeClassName(viewId + "View");
          viewModule = await import(`./views/${viewType}`);
          const view = new viewModule[viewType](Helper.strategyOptions.views[viewId])
          views.push(await view.getView());
        }
      } catch (e) {
        Helper.logError(`View '${viewId}' couldn't be loaded!`, e);
      }
    }

    // Create subviews for each area.
    for (let area of Helper.orderedAreas) {
      if (!area.hidden) {
        views.push({
          title: area.name,
          path: area.slug ?? area.name,
          subview: true,
          strategy: {
            type: "custom:linus-strategy",
            options: {
              area,
            },
          },
        });
      }
    }

    // Create subviews for each area.
    for (let floor of Helper.orderedFloors) {
      if (!floor.hidden) {
        views.push({
          title: floor.name,
          path: slugify(floor.name),
          subview: true,
          strategy: {
            type: "custom:linus-strategy",
            options: {
              floor,
            },
          },
        });
      }
    }

    // Add custom views.
    if (Helper.strategyOptions.extra_views) {
      views.push(...Helper.strategyOptions.extra_views);
    }

    // Return the created views.
    return {
      views: views,
    };
  }

  /**
   * Generate a view.
   *
   * Called when opening a subview.
   *
   * @param {generic.ViewInfo} info The view's strategy information object.
   * @return {Promise<LovelaceViewConfig>}
   */
  static async generateView(info: generic.ViewInfo): Promise<LovelaceViewConfig> {

    const floor = info.view.strategy?.options?.floor ?? {} as StrategyFloor;
    const area = info.view.strategy?.options?.area ?? {} as StrategyArea;

    let view = {} as LovelaceViewConfig

    // Create a view for each exposed domain.
    try {
      view = await new AreaView(area, floor).getView();
    } catch (e) {
      Helper.logError(`View for area '${area.name}' couldn't be loaded!`, e);
    }


    // Return the created view.
    return view;
  }
}

customElements.define("ll-strategy-linus-strategy", MushroomStrategy);

export const version = "v0.0.1";
console.info(
  "%c Linus Strategy %c ".concat(version, " "),
  "color: #F5F5DC; background: #004225; font-weight: 700;", "color: #004225; background: #F5F5DC; font-weight: 700;"
);
