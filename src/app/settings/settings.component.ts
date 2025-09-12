import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../shared/service/shared.service';
import { DialogType, Group, Role, User } from '../shared/interfaces';
import { MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { SelectModule } from 'primeng/select';
import { AuthService } from '../authservice/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { TableModule } from 'primeng/table';
import { SelectBackCloseDirective } from '../select-back-close-directive/select-back-close.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, MatButtonModule, SelectModule, MatIconModule, TableModule, SelectBackCloseDirective, MatDialogContent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  discordOauthUrl = environment.discordOauthUrl;
  discordServerUrl = environment.discordServerUrl;
  username = localStorage.getItem('username')
  token = localStorage.getItem('jwt');
  groups: Group[] = [];
  selectedGroup: Group;
  users: User[] = [];

  constructor(private dialogRef: MatDialogRef<SettingsComponent>, private sharedService: SharedService, private authService: AuthService,
    private router: Router, private route: ActivatedRoute){
    this.selectedGroup = JSON.parse(localStorage.getItem('group')!);
  }

  async ngOnInit(){
    this.sharedService.groups$.subscribe(groups => {
      this.groups = groups;
    });
    this.sharedService.users$.subscribe(users => {
      this.users = users;
    });
    this.sharedService.fetchAllGroups();
    if(this.authService.isMember() && await this.authService.isMemberTokenValid()){
      this.sharedService.fetchGroupUsers();
    }

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

  async changeGroup() {
    this.sharedService.nextGroup(this.selectedGroup);
    if(this.authService.isMember() && await this.authService.isMemberTokenValid()){
      this.sharedService.fetchGroupUsers();
    }

    const parts = this.router.url.split('/').filter(Boolean);
    if (parts.length < 2) {
      return;
    }
    const newParts = [parts[0], this.selectedGroup.name];
    await this.router.navigate(['/', ...newParts]);
  }

  isGroupMember(): boolean{
    return this.authService.isMember();
  }

  isGroupModerator(): boolean{
    return this.authService.isMod();
  }

  isGroupAdmin(): boolean{
    return this.authService.isAdmin();
  }

  isGlobalAdmin(): boolean{
    return this.authService.isGlobalAdmin();
  }

  async addMember(){
    if(await this.authService.isModTokenValid()){
      let users = await this.sharedService.getUsersNotInGroup();
      let dialogRef = this.sharedService.showSelectionDialogWithInfo('Podaj nazwę użytkownika, któremu chcesz nadać prawa członka grupy:', users,
        'Tutaj możesz wybrać jednego z użytkowników Grimloga, który nie należy do Twojej grupy.\n' + 
        'Od momentu dodania będzie on mógł widzieć wszystkich użytkowników grupy, a także\n' + 
        'dodawać oceny balansu gry.'
      );
      new Promise(() => {
        dialogRef.afterClosed().subscribe(async (username) => {
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
      let dialogRef = this.sharedService.showSelectionDialogWithInfo('Wybierz użytkownika, któremu chcesz odebrać prawa członka grupy:', users,
        'Tutaj możesz wybrać jednego z członków Twojej grupy, którego chcesz z niej wyrzucić'
      );
      new Promise(() => {
        dialogRef.afterClosed().subscribe(async (username) => {
          if(username) {
            this.sharedService.unmemberUser(username);
          }
        })
      })
    }
  }

  async addModerator(){
    if(await this.authService.isAdminTokenValid()){
      let users = await this.sharedService.getGroupMembers();
      let dialogRef = this.sharedService.showSelectionDialogWithInfo('Podaj nazwę użytkownika, któremu chcesz nadać prawa moderatora:', users,
        'Tutaj możesz wybrać jednego z członków Twojej grupy, którego awansujesz na moderatora.\n' + 
        'Od momentu awansu będzie on mógł tworzyć wpisy we wszystkich kategoriach, a także\n' + 
        'dodawać nowych członków grupy.'
      );
      new Promise(() => {
        dialogRef.afterClosed().subscribe(async (username) => {
          if(username) {
            this.sharedService.modUser(username);
          }
        })
      })
    } 
  }

  async removeModerator(){
    if(await this.authService.isAdminTokenValid()){
      let users = await this.sharedService.getGroupModerators();
      let dialogRef = this.sharedService.showSelectionDialogWithInfo('Wybierz użytkownika, któremu chcesz odebrać prawa moderatora:', users,
        'Tutaj możesz wybrać jednego z członków Twojej grupy, któremu chcesz odebrać prawa\n' + 
        'moderatora. Zostanie on zdegradowany do roli członka grupy.'
      );
      new Promise(() => {
        dialogRef.afterClosed().subscribe(async (username) => {
          if(username) {
            this.sharedService.unmodUser(username);
          }
        })
      })
    }
  }

  async addAdmin(){
    if(await this.authService.isGlobalAdminTokenValid()){
      let allUsers = await this.sharedService.getGroupUsers();
      let users = allUsers.filter(u => !u.groupRoles.some(gr => gr.role == Role.GROUP_ADMIN && gr.group.id == this.selectedGroup.id))
      let dialogRef = this.sharedService.showSelectionDialogWithInfo('Podaj nazwę użytkownika, któremu chcesz nadać prawa administratora:', users,
        'Tutaj możesz wybrać jednego z członków i moderatorów grupy i awansować go na\n' + 
        'jej administratora. Od momentu awansu będzie on mógł widzieć wszystkich dodawać\n' + 
        'i usuwać jej moderatorów, a także tworzyć wpisy we wszystkich kategoriach.'
      );
      new Promise(() => {
        dialogRef.afterClosed().subscribe(async (username) => {
          if(username) {
            this.sharedService.adminUser(username);
          }
        })
      })
    } 
  }

  async removeAdmin(){
    if(await this.authService.isGlobalAdminTokenValid()){
      let users = await this.sharedService.getGroupAdmins();
      let dialogRef = this.sharedService.showSelectionDialogWithInfo('Wybierz użytkownika, któremu chcesz odebrać prawa administratora:', users,
        'Tutaj możesz wybrać jednego z członków Twojej grupy, któremu chcesz odebrać prawa\n' + 
        'administratora. Zostanie on zdegradowany do roli członka grupy.'
      );
      new Promise(() => {
        dialogRef.afterClosed().subscribe(async (username) => {
          if(username) {
            this.sharedService.unadminUser(username);
          }
        })
      })
    }
  }

  async createNewGroup(){
    if(await this.authService.isGlobalAdminTokenValid()){
      let dialogRef = this.sharedService.showDialog(DialogType.INSERTION, "Podaj nazwę nowej grupy");
      dialogRef.afterClosed().subscribe((name) => {
        if(name){
          this.sharedService.createNewGroup(name);
        }
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
      "danej grupy o nadanie praw moderatora, lub moderatora o dodanie do grupy." +
      "\n" +
      "Wszystkie tworzone wpisy są przypisane do danej grupy graczy. Jeśli chcesz założyć nową grupę, zapraszam do zalogowania się,\n" +
      "a następnie na Grimlogowego discorda, do którego odnośnik znajduje się w zakładce Ustawienia.\n" +
      "Po założeniu grupy, dany użytkownik zostanie oznaczony jako Admin nowej grupy. Oprócz tej, istnieją jeszcze dwie role:\n" + 
      "Moderator i Użytkownik. Moderator może tworzyć nowe wpisy i dodawać nowych użytkowników, natomiast użytkownik może\n" + 
      "jedynie dodawać oceny balansu gry. Jeśli chcesz dodac kolejnego admina swojej grupy, skontaktuj się na Discordzie Grimlogowym.\n" +
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
      "Aplikacja pozwala także na wysyłanie powiadomień na swój serwer discordowy w momencie dodania/edycji wpisu,\n"+ 
      "choć zostało to wyłączone w wersji v1.5.0 i zostanie przywrócone prawdopodobnie w wersji v1.6.0.\n" +
      "W tym celu administrator grupy musi zainstalować na swoim serwerze discordowego bota Grimloga, który będzie wysyłał powiadomienia.\n" +
      "Odnośnik do tego znajduje się w zakładce Ustawienia.\n" +
      "\n" +
      "Zachęcam do odwiedzenia Discorda, gdzie można podzielić się przemyśleniami na temat aplikacji, tego co warto poprawić,\n" +
      "zgłoszenia ewentualnych błędów oraz sugestii dotyczących nowych funkcji."
    );
  }

  showChangeLog(){
    this.sharedService.showDialogWithInfoText(DialogType.INFORMATION, "Change log",
      "v1.5.0 - 11/09/2025 - grupy, discord, poprawa UI na małych ekranach\n" + 
      "- dodano system grup\n" + 
      "- dodano logowanie discordem\n" +
      "- dodano możliwość nadawania użytkownikom ról\n" + 
      "- naprawiono kolejność w skryptach\n" +
      "- poprawiono UI dropdownów na małych ekranach\n" + 
      "- dodano formę zarządzania miejscami rozgrywek\n" + 
      "- dodano progress bar podczas uploadu zdjęć\n" + 
      "- naprawiono dodawanie skryptu z JSONa\n" + 
      "- dodano change log\n" + 
      "- dodano otwieranie strony bezpośrednio na dany wpis, jeśli link zawierał id\n" +
      "- zmieniono system ocen balansu - każdy zalogowany użytkownik może teraz dodawać oceny\n" + 
      "- dodano możliwośc dodania więcej niż jednego Fable do rozgrywki\n" +
      "- naprawiono błąd podczas obliczania statystyk przynależności nie uwzględniający transformacji\n" +
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
