using UnrealBuildTool;
public class GramBanglaEditorTarget : TargetRules
{
    public GramBanglaEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        ExtraModuleNames.Add("GramBangla");
    }
}
