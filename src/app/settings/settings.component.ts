import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../shared/service/shared.service';
import { DialogType, Group, Role, User } from '../shared/interfaces';
import { MatDialogRef } from '@angular/material/dialog';
import { SelectModule } from 'primeng/select';
import { AuthService } from '../authservice/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { TableModule } from 'primeng/table';
import { SelectBackCloseDirective } from '../select-back-close-directive/select-back-close.directive';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, MatButtonModule, SelectModule, MatIconModule, TableModule, SelectBackCloseDirective],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  username = localStorage.getItem('username')
  token = localStorage.getItem('jwt');
  groups: Group[] = [];
  selectedGroup: Group;
  users: User[] = [];

  constructor(private dialogRef: MatDialogRef<SettingsComponent>, private sharedService: SharedService, private authService: AuthService){
    this.selectedGroup = JSON.parse(localStorage.getItem('group')!);
  }

  async ngOnInit(){
    this.sharedService.groups$.subscribe(groups => {
      this.groups = groups;
    });
    this.sharedService.fetchAllGroups();
    this.users = await this.sharedService.getGroupUsers();
  }

  login(){
    this.authService.showLoginDialog("Podaj nazwę użytkownika i hasło:");
    this.dialogRef.close();
  }

  logout(){
    this.authService.logout();
    this.token = null;
    this.sharedService.showDialog(DialogType.INFORMATION, "Wylogowano.");
    this.dialogRef.close();
    this.sharedService.navigate('welcome');
  }

  changeGroup(){
    this.sharedService.nextGroup(this.selectedGroup);
    this.sharedService.navigate('welcome');
    this.dialogRef.close();
  }

  isGroupMember(): boolean{
    return this.authService.hasGroupRole([Role.ADMIN, Role.MODERATOR, Role.MEMBER]);
  }

  isGroupModerator(): boolean{
    return this.authService.hasGroupRole([Role.ADMIN, Role.MODERATOR]);
  }

  isGroupAdmin(): boolean{
    return this.authService.hasGroupRole([Role.ADMIN]);
  }

  async addMember(){
    if(await this.authService.isModTokenValid()){
      let dialogRef = this.sharedService.showDialog(DialogType.INSERTION, 'Podaj nazwę użytkownika, któremu chcesz nadać prawa członka grupy:');
      new Promise(() => {
        dialogRef.afterClosed().subscribe((username) => {
          if(username) {
            this.sharedService.memberUser(username);
          }
        })
      })
    } 
  }

  async removeMember(){
    if(await this.authService.isModTokenValid()){
      let users = await this.sharedService.getGroupMembers();
      let dialogRef = this.sharedService.showSelectionDialog('Wybierz użytkownika, któremu chcesz odebrać prawa członka grupy:', users);
      new Promise(() => {
        dialogRef.afterClosed().subscribe((username) => {
          if(username) {
            this.sharedService.unmemberUser(username);
          }
        })
      })
    }
  }

  async addModerator(){
    if(await this.authService.isModTokenValid()){
      let dialogRef = this.sharedService.showDialog(DialogType.INSERTION, 'Podaj nazwę użytkownika, któremu chcesz nadać prawa moderatora:');
      new Promise(() => {
        dialogRef.afterClosed().subscribe((username) => {
          if(username) {
            this.sharedService.modUser(username);
          }
        })
      })
    } 
  }

  async removeModerator(){
    if(await this.authService.isModTokenValid()){
      let users = await this.sharedService.getGroupModerators();
      let dialogRef = this.sharedService.showSelectionDialog('Wybierz użytkownika, któremu chcesz odebrać prawa moderatora:', users);
      new Promise(() => {
        dialogRef.afterClosed().subscribe((username) => {
          if(username) {
            this.sharedService.unmodUser(username);
          }
        })
      })
    }
  }

  getRole(user: User): string {
    return user.groupRoles.filter(gr => gr.group.id === this.selectedGroup.id)[0]?.role;
  }

  showHelp(){
    this.sharedService.showDialogWithInfoText(DialogType.INFORMATION, "Co to jest i jak to działa?", 
      "Grimlog to narzędzie pozwalające grupom graczy archiwizować rozgrywki w Blood on the Clocktower.\n" +
      "Jak już pewniej zdążyłeś/aś zauwazyć, znajduje się tu kilka zakładek: Gry, Skrypty, Postacie, Gracze oraz Osiągnięcia.\n " +
      "\n" +
      "Aby móc dodawać wpisy należy się zalogować. W aplikacji dostępne jest jedynie logowanie Discordem.\n" +
      "Pozwola nam to na łatwiejszą komunikację, a także określenie tożsamości danego użytkownika. Po zalogowaniu w ten sposób,\n" +
      "(jeśli nie wykonano tego wcześniej) zostanie utworzone konto z nickiem z Discorda. Od tego momentu można poprosić administratora\n" +
      "danej grupy o nadanie praw moderatora." +
      "\n" +
      "Wszystkie tworzone wpisy są przypisane do danej grupy graczy. Jeśli chcesz założyć nową grupę, zapraszam do zalogowania się,\n" +
      "a następnie na Grimlogowego discorda, do którego odnośnik znajduje się w zakładce Ustawienia.\n" +
      "\n" +
      "Możesz przeglądać wpisy różnych grup graczy, ale nie możesz ich edytować ani usuwać.\n" + 
      "Widok danej grupy także możesz zmienić w zakładce Ustawienia.\n" +
      "\n" +
      "A dodawać można następujące wpisy:\n" +
      "W zakładce Gry możesz dodawać nowe rozgrywki, edytować je, usuwać oraz przeglądać szczegóły każdej z nich.\n" + 
      "Zachęcam do dodania zdjęcia grymuaru do każdej rozgrywki, notatki na temat co się w trakcie gry działo, a także oceny balansu.\n" +
      "W zakładce Skrypty możesz zarządzać skryptami wykorzystywanymi w rozgrywkach, tworzyć własne,\n" +
      "oraz dodawać notatki na co w danym skrypcie warto zwrócić uwagę.\n" +
      "W zakładce Postacie możesz tworzyć nowe postacie, a także dawać wskazówki jak grać.\n" +
      "Do każdej z nich jest także przypisany link, który kieruje do oficjalnej Bloodowej wiki.\n" +
      "W zakładce Gracze możesz zarządzać graczami któzy brali udział w rozgrywkach w Twojej grupie.\n" +
      "Zakładka Osiągnięcia jest eksperymentalna. Gracze mogą je wykorzystywać w dowolny sposób.\n" +
      "Dodatkowo dla każdego typu encji obliczane są statystyki, które mogą pomóc w analizie rozgrywek, a także rywalizacji\n" +
      "\"kto jest lepszy\".\n" +
      "\n" +
      "Aplikacja pozwala także na wysyłanie powiadomień na swój serwer discordowy w momencie dodania/edycji wpisu.\n" +
      "W tym celu administrator grupy musi zainstalować na swoim serwerze discordowego bota Grimloga, który będzie wysyłał powiadomienia.\n" +
      "Odnośnik do tego znajduje się w zakładce Ustawienia.\n" +
      "\n" +
      "Zachęcam do odwiedzenia Discorda, gdzie można podzielić się przemyśleniami na temat aplikacji, tego co warto poprawić,\n" +
      "zgłoszenia ewentualnych błędów oraz sugestii dotyczących nowych funkcji."
    );
  }

  showChangeLog(){
    this.sharedService.showDialogWithInfoText(DialogType.INFORMATION, "Change log",
      "v1.5.0 - ??/09/2025 - grupy, discord, poprawa UI na małych ekranach\n" + 
      "\n" + 
      "v1.4.1 - 12/06/2025 - małe poprawki UI\n" + 
      "- ustawianie dat dla achievementów\n" +
      "- zwiększono limit rozmiaru zdjęc do 15MB\n" + 
      "- naprawiono url do strony w powiadomieniach discordowcyh\n" +
      "- dodano możliwość edycji ikon postaci\n" +
      "- dodano przycisk pomocy na ekranie serwerów discordowych\n" +
      "- przesunięto nazwy postaci bliżej ikon m.in. na ekranie szczegółów rozgrywki\n" + 
      "- dodano tabelę ze statystykami dla storytellerów\n" + 
      "- dodano filtr doświadczenia dla graczy wszyscy/zaawansowani/eksperci (1, 10, 30 dla ST; 1, 15, 40 dla graczy)\n" +
      "\n" + 
      "v1.4.0 - 17/05/2025 - achievementy, balans, upload zdjęć, nazwa\n" + 
      "- dodano system achievementów\n" + 
      "- dodano możliwość oceny balansu gry\n" + 
      "- dodano możliwość dodawania zdjęć do rozgrywek\n" + 
      "- dodano przycisk z popupem ustawień\n" +
      "- dodano wylogowywanie się, a ważność tokenu zmieniono na 30 dni\n" +
      "- dodano pole wskazówek dla postaci\n" + 
      "- dodano obrazki postaci\n" + 
      "- dodano pole Autor dla skryptu\n" + 
      "- dodano możliwość uploadu skryptu z JSONa\n" + 
      "- dodano pole nick na discordzie dla graczy\n" +
      "- zmieniono nazwę na Grimlog\n" + 
      "\n" + 
      "v1.3.0 - 18/04/2025 - logowanie, dzielenie widoku\n" + 
      "- dodano id wpisu w pasku URL\n" + 
      "- dodano logowanie\n" + 
      "- zabezpieczono dodawanie/edycję wpisów - tylko dla zalogowanych\n" +
      "- dodano odnośniki do graczy/skryptów/etc. na ekranach ze szczegółami danego wpisu\n" + 
      "- dodano dzielenie widoku na pół dla małych ekranów\n" + 
      "- dodano pole notatek do skryptu\n" + 
      "\n" + 
      "v1.2.0 - 03/04/25 - statystyki, kolory\n" + 
      "- \"odchudzono\" requesty do bazy, przez co zmniejszono czas oczekiwania\n" + 
      "- dodano sortowanie i filtrowanie tabelek\n" + 
      "- dodano możliwość ukrywania nieaktywnych graczy (liczba gier < 10)\n" + 
      "- zmieniono wypełnienie komórek DOBRO/ZŁO kolorem na ikonki z kolorem\n" +
      "- dodano kolory do statystyk bycia dobrym/złym, a także do statystyk wygranych/przegranych\n" + 
      "- dodano statystyki dla graczy na temat postaci w które się wcielał\n" + 
      "- dodano statystyki dla skryptów na temat postaci które były grane\n" + 
      "\n" +
      "v1.1.0 - 13/03/2025 - poprawki pól, transformacje postaci\n" + 
      "- poprawiono layout na małych ekranach\n" + 
      "- naprawiono datę przy tworzeniu rozgrywki\n" + 
      "- naprawiono zapisywanie miejsca rozgrywki\n" + 
      "- dodano pola wyszukiwania w dropdownach\n" + 
      "- dodano możliwośc modyfikacji postaci polegająca na zdefiniowaniu w ilu egzemplarzach może wystąpić\n" + 
      "- dodano możliwość transformacji postaci w inną (nawet kilkukrotnie). Zmieniony gracz do statystyk wygranej/przegranej \n" + 
      "  zalicza tylko postać, którą stał się jako ostatnią\n" + 
      "\n" +
      "v1.0.0 - 04/03/2025 - pierwsza wersja\n" + 
      "- podstawowe tabelki\n" +
      "- podstawowe formy dodania wpisów\n"
    );
  }
}
