import { View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { Label } from "../../../components/core/typography/Label";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";

type Props = {};

const styles = StyleSheet.create({
  card: {
    // iOS and Android card shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: -7,
    zIndex: -7,
    backgroundColor: variables.brandGray,
    borderRadius: 8,
    marginLeft: 0,
    marginRight: 0
  },
  cardInner: {
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 18
  },
  row: {
    flexDirection: "row"
  },
  spaced: {
    justifyContent: "space-between"
  },
  cardLogo: {
    height: 30,
    width: 48
  },
  rotatedCard: {
    shadowColor: "#000",
    marginBottom: -30,
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [{ perspective: 1200 }, { rotateX: "-20deg" }, { scaleX: 0.99 }],
    height: 95
  },
  shadowBox: {
    marginBottom: -15,
    borderRadius: 8,
    borderTopWidth: 8,
    borderTopColor: "rgba(0,0,0,0.1)",
    height: 15
  }
});

/**
 * A Generic preview card layout extracted from {@link CardComponent} and simplified.
 * Can be used to render a generic wallet preview card.
 * TODO: in this phase the CardComponent is preserved and no refactoring has been done on the pre-existing code
 * @param props
 * @constructor
 */
export const CardPreview: React.FunctionComponent<Props> = props => (
  <>
    {/* In order to render the shadow on android */}
    {Platform.OS === "android" && <View style={styles.shadowBox} />}
    <TouchableDefaultOpacity
      onPress={() => console.log("asd")}
      accessible={true}
      accessibilityLabel={I18n.t("wallet.accessibility.cardsPreview")}
      accessibilityRole={"button"}
      style={styles.rotatedCard}
    >
      <View style={[styles.card]}>
        <View style={[styles.cardInner]}>
          <View style={[styles.row, styles.spaced]}>
            <View style={styles.row}>
              <Label>Ciao</Label>
            </View>
            <View>
              <Label>DX</Label>
            </View>
          </View>
          <View spacer={true} />
        </View>
      </View>
    </TouchableDefaultOpacity>
  </>
);
