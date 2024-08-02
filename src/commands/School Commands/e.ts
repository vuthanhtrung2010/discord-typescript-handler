import { handlemsg } from "../../handlers/functions";
import { MessageCommand } from "../../types";
import { EmbedBuilder } from "discord.js";

export const Command: MessageCommand = {
  name: "e",
  aliases: ["number-e"],
  category: "School Commands",
  description: "Shows the Number e",
  usage: "e",
  cooldown: 2,
  type: "math",
  run: async (client, message, args, GuildSettings) => {
    const ls = GuildSettings?.language as string;

    const e =
      `2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516642742746639193200305992181741359662904357290033429526059563073813232862794349076323382988075319525101901157383418793070215408914993488416750924476146066808226480016847741185374234544243710753907774499206955170276183860626133138458300075204493382656029760673711320070932870912744374704723069697720931014169283681902551510865746377211125238978442505695369677078544996996794686445490598793163688923009879312773617821542499922957635148220826989519366803318252886939849646510582093923982948879332036250944311730123819706841614039701983767932068328237646480429531180232878250981945581530175671736133206981125099618188159304169035159888851934580727386673858942287922849989208680582574927961048419844436346324496848756023362482704197862320900216099023530436994184914631409343173814364054625315209618369088870701676839642437814059271456354906130310720851038375051011574770417189861068739696552126715468895703503540212340784981933432106817012100562788023519303322474501585390473041995777709350366041699732972508868769664035557071622684471625607988265178713419512466520103059212366771943252786753985589448969709640975459185695638023637016211204774272283648961342251644507818244235294863637214174023889344124796357437026375529444833799801612549227850925778256209262264832627793338656648162772516401910590049164499828931505660472580277863186415519565324425869829469593080191529872117255634754639644791014590409058629849679128740687050489585867174798546677575732056812884592054133405392200011378630094556068816674001698420558040336379537645203040243225661352783695117788386387443966253224985065499588623428189970773327617178392803494650143455889707194258639877275471096295374152111513683506275260232648472870392076431005958411661205452970302364725492966693811513732275364509888903136020572481765851180630364428123149655070475102544650117272115551948668508003685322818315219600373562527944951582841882947876108526398139559900673764829224437528718462457803619298197139914756448826260390338144182326251509748279877799643730899703888677822713836057729788241`
        .split(" ")
        .join("")
        .split("\n")
        .join("");

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#0000ff")
          .setThumbnail(client.user?.displayAvatarURL() as string)
          .setTitle(client.la?.[ls]["cmds"]["schoolcommands"]["e"]["variable1"])
          .setDescription(
            handlemsg(
              client.la?.[ls]["cmds"]["schoolcommands"]["e"]["variable2"],
              {
                e: e.substring(0, 2040),
              },
            ),
          ),
      ],
    });
  },
};
