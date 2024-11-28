import { Helper } from "./Helper";
import { generic } from "./types/strategy/generic";
import { LovelaceConfig, LovelaceViewConfig } from "./types/homeassistant/data/lovelace";
import { AREA_CARDS_DOMAINS, DEVICE_CLASSES, DOMAIN_ICONS, DOMAINS_VIEWS } from "./variables";
import { AreaView } from "./views/AreaView";
import { getAreaName, getFloorName } from "./utils";
import { FloorView } from "./views/FloorView";

/**
 * Linus Dashboard Strategy.<br>
 * <br>
 * Linus dashboard strategy provides a strategy for Home-Assistant to create a dashboard automatically.<br>
 * The strategy makes use of Mushroom and Mini Graph cards to represent your entities.<br>
 * <br>
 * Features:<br>
 *     🛠 Automatically create a dashboard with minimal configuration.<br>
 *     😍 Built-in views for several standard domains.<br>
 *     🎨 Many options to customize to your needs.<br>
 * <br>
 * Check the [Repository]{@link https://github.com/AalianKhan/linus-strategy} for more information.
 */
class LinusStrategy extends HTMLTemplateElement {
  /**
   * Generate a dashboard.
   *
   * Called when opening a dashboard.
   *
   * @param {generic.DashBoardInfo} info Dashboard strategy information object.
   * @return {Promise<LovelaceConfig>}
   */
  static async generateDashboard(info: generic.DashBoardInfo): Promise<LovelaceConfig> {
    await Helper.initialize(info);

    console.log('info', info);

    const views: LovelaceViewConfig[] = info.config?.views ?? [];

    LinusStrategy.createDomainSubviews(views);
    LinusStrategy.createUnavailableEntitiesSubview(views);
    LinusStrategy.createAreaSubviews(views);
    LinusStrategy.createFloorSubviews(views);

    if (Helper.strategyOptions.extra_views) {
      views.push(...Helper.strategyOptions.extra_views);
    }

    return { views };
  }

  /**
   * Create subviews for each domain.
   *
   * @param {LovelaceViewConfig[]} views Array of Lovelace view configurations.
   */
  private static createDomainSubviews(views: LovelaceViewConfig[]) {
    for (let domainId of Helper.getExposedViewIds()) {
      if (!DOMAINS_VIEWS.includes(domainId)) continue;
      if (AREA_CARDS_DOMAINS.includes(domainId) && (Helper.domains[domainId] ?? []).length === 0) continue;
      views.push({
        title: domainId,
        icon: DOMAIN_ICONS[domainId as keyof typeof DOMAIN_ICONS],
        path: domainId,
        subview: !Object.keys(DOMAIN_ICONS).includes(domainId),
        strategy: {
          type: "custom:linus-strategy",
          options: { domainId },
        },
      });
    }
  }

  /**
   * Create a subview for unavailable entities.
   *
   * @param {LovelaceViewConfig[]} views Array of Lovelace view configurations.
   */
  private static createUnavailableEntitiesSubview(views: LovelaceViewConfig[]) {
    views.push({
      title: "Unavailable",
      path: "unavailable",
      subview: true,
      strategy: {
        type: "custom:linus-strategy",
        options: { domainId: "unavailable" },
      },
    });
  }

  /**
   * Create subviews for each area.
   *
   * @param {LovelaceViewConfig[]} views Array of Lovelace view configurations.
   */
  private static createAreaSubviews(views: LovelaceViewConfig[]) {
    for (let area of Helper.orderedAreas) {
      if (!area.hidden) {
        views.push({
          title: getAreaName(area),
          path: area.slug ?? area.name,
          subview: true,
          strategy: {
            type: "custom:linus-strategy",
            options: { area },
          },
        });
      }
    }
  }

  /**
   * Create subviews for each floor.
   *
   * @param {LovelaceViewConfig[]} views Array of Lovelace view configurations.
   */
  private static createFloorSubviews(views: LovelaceViewConfig[]) {
    for (let floor of Helper.orderedFloors) {
      if (!floor.hidden) {
        views.push({
          title: getFloorName(floor),
          path: floor.floor_id,
          subview: true,
          strategy: {
            type: "custom:linus-strategy",
            options: { floor },
          },
        });
      }
    }
  }

  /**
   * Generate a view.
   *
   * Called when opening a subview.
   *
   * @param {generic.ViewInfo} info The view's strategy information object.
   * @return {Promise<LovelaceViewConfig>}
   */
  /**
   * Generate a view.
   *
   * Called when opening a subview.
   *
   * @param {generic.ViewInfo} info The view's strategy information object.
   * @return {Promise<LovelaceViewConfig>}
   */
  static async generateView(info: generic.ViewInfo): Promise<LovelaceViewConfig> {
    const { domainId, floor, area } = info.view.strategy?.options ?? {};
    let view: LovelaceViewConfig = {};

    try {
      if (area) {

        view = await new AreaView(area).getView();

      } else if (floor) {

        view = await new FloorView(floor).getView();

      } else if (domainId) {

        if (domainId === "unavailable") {

          const viewModule = await import("./views/UnavailableView");
          view = await new viewModule.UnavailableView().getView();

        } else if ([...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor].includes(domainId)) {

          const viewModule = await import("./views/AggregateView");
          view = await new viewModule.AggregateView({ device_class: domainId }).getView();

        } else {

          const viewType = Helper.sanitizeClassName(domainId + "View");
          const viewModule = await import(`./views/${viewType}`);
          view = await new viewModule[viewType](Helper.strategyOptions.views[domainId]).getView();

        }
      }
    } catch (e) {
      Helper.logError(`View for '${info.view.strategy?.options}' couldn't be loaded!`, e);
    }

    return view;
  }
}

customElements.define("ll-strategy-linus-strategy", LinusStrategy);

export const version = "v0.0.1";
console.info(
  "%c Linus Strategy %c ".concat(version, " "),
  "color: #F5F5DC; background: #004225; font-weight: 700;", "color: #004225; background: #F5F5DC; font-weight: 700;"
);
