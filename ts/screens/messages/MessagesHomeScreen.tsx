import { none, Option, some } from "fp-ts/lib/Option";
import debounce from "lodash/debounce";
import {
  Button,
  Input,
  Item,
  Tab,
  TabHeading,
  Tabs,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Animated, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import MessagesArchive from "../../components/messages/MessagesArchive";
import MessagesDeadlines from "../../components/messages/MessagesDeadlines";
import MessagesInbox from "../../components/messages/MessagesInbox";
import MessagesSearch from "../../components/messages/MessagesSearch";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import {
  loadMessages,
  setMessagesArchivedState
} from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  searchText: Option<string>;
  debouncedSearchText: Option<string>;
  animVal: Animated.Value;
  scrollBarVal?: Animated.AnimatedInterpolation;
};

const styles = StyleSheet.create({
  tabBarContainer: {
    elevation: 0,
    height: 40
  },
  tabBarContent: {
    fontSize: customVariables.fontSizeSmall
  },
  tabBarUnderline: {
    borderBottomColor: customVariables.tabUnderlineColor,
    borderBottomWidth: customVariables.tabUnderlineHeight
  },
  tabBarUnderlineActive: {
    height: customVariables.tabUnderlineHeight,
    // borders do not overlap eachother, but stack naturally
    marginBottom: -customVariables.tabUnderlineHeight,
    backgroundColor: customVariables.contentPrimaryBackground
  },
  noSearchBarText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  shadowContainer: {
    backgroundColor: "#FFFFFF"
  },
  shadow: {
    width: "100%",
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandGray,
    // iOS shadow
    shadowColor: customVariables.footerShadowColor,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 5,
    shadowOpacity: 1,
    // Android shadow
    elevation: 5,
    marginTop: -1
  },
  ioSearchContainer: {
    width: "100%",
    flex: 1
  },
  ioSearch: {
    paddingHorizontal: 6,
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "space-between",
    width: 40,
    height: 40,
    minWidth: 40
  },
  searchDisableIcon: {
    color: customVariables.headerFontColor
  }
});

/**
 * A screen that contains all the Tabs related to messages.
 */
class MessagesHomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchText: none,
      debouncedSearchText: none,
      animVal: new Animated.Value(0)
    };
  }

  public componentDidMount() {
    console.log("MessageHomeScreen::DidMount");

    this.props.refreshMessages();

    this.state.animVal.setValue(0);

    this.setState({
      scrollBarVal: this.state.animVal.interpolate({
        inputRange: [0, 72 * 3],
        outputRange: [0, 72],
        extrapolate: "clamp"
      })
    });
    console.log("MessageHomeScreen::DidMount.state", this.state.scrollBarVal);
  }

  private renderShadow = () => (
    <View style={styles.shadowContainer}>
      <View style={styles.shadow} />
    </View>
  );

  public render() {
    const { searchText } = this.state;

    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        appLogo={true}
        headerBody={
          searchText.isSome() ? (
            <Item>
              <Input
                placeholder={I18n.t("global.actions.search")}
                value={searchText.value}
                onChangeText={this.onSearchTextChange}
                autoFocus={true}
              />
              <IconFont name="io-close" onPress={this.onSearchDisable} />
            </Item>
          ) : (
            <View style={styles.ioSearchContainer}>
              <Button
                onPress={this.onSearchEnable}
                transparent={true}
                style={styles.ioSearch}
                accessible={true}
                accessibilityLabel={I18n.t("global.actions.search")}
              >
                <IconFont name="io-search" />
              </Button>
            </View>
          )
        }
      >
        {!searchText.isSome() && (
          <React.Fragment>
            <ScreenContentHeader
              title={I18n.t("messages.contentTitle")}
              icon={require("../../../img/icons/message-icon.png")}
              changingHeight={this.state.scrollBarVal || 0}
            />
          </React.Fragment>
        )}

        {searchText.isSome() ? this.renderSearch() : this.renderTabs()}
      </TopScreenComponent>
    );
  }

  /**
   * Render Inbox, Deadlines and Archive tabs.
   */
  private renderTabs = () => {
    const {
      isExperimentalFeaturesEnabled,
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail,
      updateMessagesArchivedState
    } = this.props;

    return (
      <Tabs
        tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
        tabBarUnderlineStyle={styles.tabBarUnderlineActive}
      >
        <Tab
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("messages.tab.inbox")}
              </Text>
            </TabHeading>
          }
        >
          {this.renderShadow()}
          <MessagesInbox
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            onRefresh={refreshMessages}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
            animated={{
              onScroll: Animated.event(
                [{ nativeEvent: { contentOffset: { y: this.state.animVal } } }],
                {
                  useNativeDriver: true
                }
              ),
              scrollEventThrottle: 16
            }}
          />
        </Tab>
        {isExperimentalFeaturesEnabled && (
          <Tab
            heading={
              <TabHeading>
                <Text style={styles.tabBarContent}>
                  {I18n.t("messages.tab.deadlines")}
                </Text>
              </TabHeading>
            }
          >
            {this.renderShadow()}
            <MessagesDeadlines
              messagesState={lexicallyOrderedMessagesState}
              servicesById={servicesById}
              paymentsByRptId={paymentsByRptId}
              setMessagesArchivedState={updateMessagesArchivedState}
              navigateToMessageDetail={navigateToMessageDetail}
            />
          </Tab>
        )}

        <Tab
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("messages.tab.archive")}
              </Text>
            </TabHeading>
          }
        >
          {this.renderShadow()}
          <MessagesArchive
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            onRefresh={refreshMessages}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
          />
        </Tab>
      </Tabs>
    );
  };

  /**
   * Render MessageSearch component.
   */
  private renderSearch = () => {
    const {
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail
    } = this.props;

    const { debouncedSearchText } = this.state;

    return debouncedSearchText
      .map(
        _ =>
          _.length < 3 ? (
            this.renderInvalidSearchBarText()
          ) : (
            <MessagesSearch
              messagesState={lexicallyOrderedMessagesState}
              servicesById={servicesById}
              paymentsByRptId={paymentsByRptId}
              onRefresh={refreshMessages}
              navigateToMessageDetail={navigateToMessageDetail}
              searchText={_}
            />
          )
      )
      .getOrElse(this.renderInvalidSearchBarText());
  };

  private renderInvalidSearchBarText = () => {
    return (
      <View style={styles.noSearchBarText}>
        <Text>{I18n.t("global.search.invalidSearchBarText")}</Text>
      </View>
    );
  };

  private onSearchEnable = () => {
    this.setState({
      searchText: some("")
    });
  };

  private onSearchTextChange = (text: string) => {
    this.setState({
      searchText: some(text)
    });
    this.updateDebouncedSearchText(text);
  };

  private updateDebouncedSearchText = debounce(
    (text: string) =>
      this.setState({
        debouncedSearchText: some(text)
      }),
    300
  );

  private onSearchDisable = () => {
    this.setState({
      searchText: none,
      debouncedSearchText: none
    });
  };
}

const mapStateToProps = (state: GlobalState) => ({
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled,
  lexicallyOrderedMessagesState: lexicallyOrderedMessagesStateSelector(state),
  servicesById: servicesByIdSelector(state),
  paymentsByRptId: paymentsByRptIdSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshMessages: () => {
    dispatch(loadMessages.request());
  },
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageDetailScreenAction({ messageId })),
  updateMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => dispatch(setMessagesArchivedState(ids, archived))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessagesHomeScreen);
