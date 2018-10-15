/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */
import {
  Body,
  Button,
  Container,
  Content,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

import I18n from "../../i18n";
import variables from "../../theme/variables";
import { Wallet } from "../../types/pagopa";
import GoBackButton from "../GoBackButton";
import { InstabugButtons } from "../InstabugButtons";
import { WalletStyles } from "../styles/wallet";
import AppHeader from "../ui/AppHeader";
import IconFont from "../ui/IconFont";
import CardComponent from "./card/CardComponent";
import { LogoPosition } from "./card/Logo";

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: variables.brandDarkGray
  },
  firstCard: {
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [{ perspective: 700 }, { rotateX: "-20deg" }, { scaleX: 0.98 }],
    zIndex: -10
  },
  secondCard: {
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [
      { perspective: 700 },
      { rotateX: "-20deg" },
      { translateY: -(58 / 2 + 20) * (1 - Math.cos(20)) },
      { scaleX: 0.98 }
    ],
    zIndex: -10
  },
  shiftDown: {
    marginBottom: -(58 / 2 + 1)
  }
});

// card type to be displayed at
// the bottom of the header
export enum CardEnum {
  NONE, // show no card
  FAN, // "fanned cards" (not really fanned, but you get the idea)
  FULL, // full-sized card
  HEADER // card header (only card number & logo)
}

type FullCard = Readonly<{
  type: CardEnum.FULL;
  card: Wallet;
}>;

type HeaderCard = Readonly<{
  type: CardEnum.HEADER;
  card: Wallet;
}>;

type FannedCards = Readonly<{
  type: CardEnum.FAN;
  cards: ReadonlyArray<Wallet>;
}>;

type NoCards = Readonly<{
  type: CardEnum.NONE;
}>;

export type CardType = FullCard | HeaderCard | FannedCards | NoCards;

type Props = Readonly<{
  title: string;
  headerContents?: React.ReactNode;
  cardType: CardType;
  showPayButton: boolean;
  allowGoBack: boolean;
  favoriteWallet?: number;
  onSetFavoriteWallet?: (walletId?: number) => void;
  onDeleteWallet?: (walletId: number) => void;
  navigateToWalletList: () => void;
  navigateToScanQrCode: () => void;
  navigateToWalletTransactions: (wallet: Wallet) => void;
}>;

export default class WalletLayout extends React.Component<Props> {
  // tslint:disable-next-line:cognitive-complexity
  private displayedWallets(): React.ReactNode {
    const { favoriteWallet, onSetFavoriteWallet, onDeleteWallet } = this.props;

    const onSetFavoriteForWallet = (idWallet: number) =>
      onSetFavoriteWallet !== undefined
        ? (willBeFavorite: boolean) =>
            onSetFavoriteWallet(willBeFavorite ? idWallet : undefined)
        : undefined;

    const onDeleteForWallet = (idWallet: number) =>
      onDeleteWallet !== undefined ? () => onDeleteWallet(idWallet) : undefined;

    switch (this.props.cardType.type) {
      case CardEnum.NONE:
        return null;

      case CardEnum.FAN: {
        const { cards } = this.props.cardType;
        return (
          <TouchableOpacity onPress={this.props.navigateToWalletList}>
            {cards.length === 1 ? (
              <View style={WalletStyles.container}>
                <CardComponent
                  wallet={cards[0]}
                  logoPosition={LogoPosition.TOP}
                  flatBottom={true}
                  headerOnly={true}
                  rotated={true}
                  isFavorite={
                    favoriteWallet !== undefined &&
                    favoriteWallet === cards[0].idWallet
                  }
                  onSetFavorite={onSetFavoriteForWallet(cards[0].idWallet)}
                  onDelete={onDeleteForWallet(cards[0].idWallet)}
                  navigateToWalletTransactions={
                    this.props.navigateToWalletTransactions
                  }
                />
              </View>
            ) : (
              <View style={styles.shiftDown}>
                <View style={styles.firstCard}>
                  <CardComponent
                    wallet={cards[0]}
                    logoPosition={LogoPosition.TOP}
                    flatBottom={true}
                    headerOnly={true}
                    isFavorite={
                      favoriteWallet !== undefined &&
                      favoriteWallet === cards[0].idWallet
                    }
                    onSetFavorite={onSetFavoriteForWallet(cards[0].idWallet)}
                    onDelete={onDeleteForWallet(cards[0].idWallet)}
                    navigateToWalletTransactions={
                      this.props.navigateToWalletTransactions
                    }
                  />
                </View>
                <View style={styles.secondCard}>
                  <CardComponent
                    wallet={cards[1]}
                    logoPosition={LogoPosition.TOP}
                    flatBottom={true}
                    headerOnly={true}
                    isFavorite={
                      favoriteWallet !== undefined &&
                      favoriteWallet === cards[1].idWallet
                    }
                    onSetFavorite={onSetFavoriteForWallet(cards[1].idWallet)}
                    onDelete={onDeleteForWallet(cards[1].idWallet)}
                    navigateToWalletTransactions={
                      this.props.navigateToWalletTransactions
                    }
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      }
      case CardEnum.FULL: {
        return (
          <View style={WalletStyles.container}>
            <CardComponent
              wallet={this.props.cardType.card}
              showFavoriteIcon={false}
              menu={true}
              lastUsage={false}
              flatBottom={true}
              isFavorite={
                favoriteWallet !== undefined &&
                favoriteWallet === this.props.cardType.card.idWallet
              }
              onSetFavorite={onSetFavoriteForWallet(
                this.props.cardType.card.idWallet
              )}
              onDelete={onDeleteForWallet(this.props.cardType.card.idWallet)}
              navigateToWalletTransactions={
                this.props.navigateToWalletTransactions
              }
            />
          </View>
        );
      }
      case CardEnum.HEADER: {
        return (
          <View style={WalletStyles.container}>
            <CardComponent
              wallet={this.props.cardType.card}
              logoPosition={LogoPosition.TOP}
              flatBottom={true}
              headerOnly={true}
              rotated={true}
              isFavorite={
                favoriteWallet !== undefined &&
                favoriteWallet === this.props.cardType.card.idWallet
              }
              onSetFavorite={onSetFavoriteForWallet(
                this.props.cardType.card.idWallet
              )}
              onDelete={onDeleteForWallet(this.props.cardType.card.idWallet)}
              navigateToWalletTransactions={
                this.props.navigateToWalletTransactions
              }
            />
          </View>
        );
      }
      default: {
        ((): never => this.props.cardType)();
        return null;
      }
    }
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader style={styles.darkGrayBg}>
          {this.props.allowGoBack && (
            <Left>
              <GoBackButton white={true} />
            </Left>
          )}
          <Body>
            <Text style={WalletStyles.white}>{this.props.title}</Text>
          </Body>
          <Right>
            <InstabugButtons color={variables.colorWhite} />
          </Right>
        </AppHeader>

        <ScrollView bounces={false} style={WalletStyles.whiteBg}>
          <Content
            scrollEnabled={false}
            style={[styles.darkGrayBg, WalletStyles.noBottomPadding]}
          >
            {this.props.headerContents}
            {this.displayedWallets()}
          </Content>
          {this.props.children}
        </ScrollView>
        {this.props.showPayButton && (
          <View footer={true}>
            <Button
              block={true}
              onPress={() => {
                this.props.navigateToScanQrCode();
              }}
            >
              <IconFont name="io-qr" style={{ color: variables.colorWhite }} />
              <Text>{I18n.t("wallet.payNotice")}</Text>
            </Button>
          </View>
        )}
      </Container>
    );
  }
}
