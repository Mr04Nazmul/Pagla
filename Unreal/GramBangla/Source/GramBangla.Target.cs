using UnrealBuildTool;
public class GramBanglaTarget : TargetRules
{
    public GramBanglaTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        ExtraModuleNames.Add("GramBangla");
    }
}
