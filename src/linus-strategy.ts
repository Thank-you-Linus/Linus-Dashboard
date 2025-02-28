import { Helper } from "./Helper";
import { generic } from "./types/strategy/generic";
import { LovelaceConfig, LovelaceViewConfig } from "./types/homeassistant/data/lovelace";
import { AGGREGATE_DOMAINS, CUSTOM_VIEWS, DEVICE_CLASSES, DOMAINS_VIEWS, VIEWS_ICONS } from "./variables";
import { AreaView } from "./views/AreaView";
import { getAreaName, getDomainTranslationKey, getFloorName, getGlobalEntitiesExceptUndisclosed } from "./utils";
import { FloorView } from "./views/FloorView";
import { ResourceKeys } from "./types/homeassistant/data/frontend";

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
    if (!Helper.isInitialized()) await Helper.initialize(info);

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
    const exposedViewIds = Helper.getExposedViewIds();
    exposedViewIds.forEach(viewId => {
      if (Helper.linus_dashboard_config?.excluded_domains?.includes(viewId)) return;
      if (Helper.linus_dashboard_config?.excluded_device_classes?.includes(viewId)) return;
      if (![...CUSTOM_VIEWS, ...DOMAINS_VIEWS].includes(viewId)) return;

      let domain = viewId;
      let device_class;

      if (DEVICE_CLASSES.binary_sensor.includes(viewId)) {
        domain = "binary_sensor";
        device_class = viewId;
      } else if (DEVICE_CLASSES.sensor.includes(viewId)) {
        domain = "sensor";
        device_class = viewId;
      }
      const entities = getGlobalEntitiesExceptUndisclosed(domain, device_class);
      if (DOMAINS_VIEWS.includes(viewId) && entities.length === 0) return;

      views.push({
        title: Helper.localize(getDomainTranslationKey(domain, device_class ?? "_")),
        icon: (VIEWS_ICONS as Record<string, string>)[viewId] ?? Helper.icons[device_class === "battery" ? "binary_sensor" : domain as ResourceKeys]?.[device_class ?? "_"]?.default,
        path: viewId,
        subview: !Object.keys(VIEWS_ICONS).includes(viewId),
        strategy: {
          type: "custom:linus-strategy",
          options: { viewId },
        },
      });
    });
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
        options: { viewId: "unavailable" },
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
    const { viewId, floor, area } = info.view.strategy?.options ?? {};
    let view: LovelaceViewConfig = {};

    if (area) {
      try {
        view = await new AreaView(area).getView();
      } catch (e) {
        Helper.logError(`View for '${area?.name}' couldn't be loaded!`, e);
      }
    } else if (floor) {
      try {
        view = await new FloorView(floor).getView();
      } catch (e) {
        Helper.logError(`View for '${floor?.name}' couldn't be loaded!`, e);
      }
    } else if (viewId) {
      try {

        if (viewId === "unavailable") {

          const viewModule = await import("./views/UnavailableView");
          view = await new viewModule.UnavailableView().getView();

        } else if (AGGREGATE_DOMAINS.includes(viewId)) {

          const viewModule = await import("./views/AggregateView");
          view = await new viewModule.AggregateView({ domain: viewId }).getView();

        } else if ([...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor].includes(viewId)) {

          const domain = DEVICE_CLASSES.binary_sensor.includes(viewId) ? "binary_sensor" : "sensor";

          const viewModule = await import("./views/AggregateView");
          view = await new viewModule.AggregateView({ domain, device_class: viewId }).getView();

        } else {

          const viewType = Helper.sanitizeClassName(viewId + "View");
          const viewModule = await import(`./views/${viewType}`);
          view = await new viewModule[viewType](Helper.strategyOptions.views[viewId]).getView();

        }
      } catch (e) {
        Helper.logError(`View for '${viewId}' couldn't be loaded!`, e);
      }

    }

    return view;
  }
}

customElements.define("ll-strategy-linus-strategy", LinusStrategy);

export const version = "v1.1.0";
console.info(
  "%c Linus Strategy %c ".concat(version, " "),
  "color: #F5F5DC; background: #004225; font-weight: 700;", "color: #004225; background: #F5F5DC; font-weight: 700;"
);
