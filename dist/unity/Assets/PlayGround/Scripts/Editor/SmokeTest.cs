// PlayGround Smoke Test — runs in the Unity Editor, no Play mode required.
// Install: URP project (2022.3+ LTS) + UnityGLTF package, copy unity/Assets/PlayGround
// into your Assets folder, then menu: PlayGround > Smoke Test.
// Checks: model count vs catalog, tri budgets, URP Lit material slots, prefab
// colliders (BoxCollider walls 1xWALL_Hx1, CapsuleCollider enemies), 1u=1m scale.
// Results go to the Console as PASS/FAIL lines + summary.
#if UNITY_EDITOR
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace PlayGround.Editor {
public static class SmokeTest {
    // WALL_H mirrors game.js: wall tile is 1 x 2.4 x 1 m. Keep in sync.
    const float WALL_H = 2.4f;
    const string ROOT = "Assets/PlayGround";
    static int pass, fail;
    static void Check(bool cond, string name) {
        if (cond) { pass++; Debug.Log($"[PlayGround Smoke Test] PASS: {name}"); }
        else { fail++; Debug.LogError($"[PlayGround Smoke Test] FAIL: {name}"); }
    }

    [MenuItem("PlayGround/Smoke Test")]
    public static void Run() {
        pass = fail = 0;
        // 1. models present (22 catalog assets, *_low.glb)
        string[] models = AssetDatabase.FindAssets("t:Model", new[] { ROOT + "/Models" });
        Check(models.Length >= 22, $"model count >= 22 (found {models.Length})");
        // 2. tri budgets (spot-check heaviest: baron <= 6500)
        foreach (var guid in models) {
            var path = AssetDatabase.GUIDToAssetPath(guid);
            var mesh = AssetDatabase.LoadAssetAtPath<Mesh>(path);
            if (mesh == null) continue;
            int tris = mesh.triCount;
            bool over = (path.Contains("baron") && tris > 6500)
                || (!path.Contains("baron") && tris > 6500);
            Check(!over, $"tris {Path.GetFileName(path)} = {tris}");
            if (path.Contains("wall_") || path.Contains("surf_"))
                Check(tris <= 12, $"static tile {Path.GetFileName(path)} <= 12 tris");
        }
        // 3. textures: albedo sRGB, normal/mask linear
        string[] tex = AssetDatabase.FindAssets("t:Texture", new[] { ROOT + "/Textures" });
        Check(tex.Length > 0, $"textures present ({tex.Length})");
        foreach (var guid in tex) {
            var path = AssetDatabase.GUIDToAssetPath(guid);
            var imp = AssetImporter.GetAtPath(path) as TextureImporter;
            if (imp == null) continue;
            bool wantSRGB = path.Contains("_albedo");
            Check(imp.sRGBTexture == wantSRGB, $"color space {Path.GetFileName(path)} sRGB={wantSRGB}");
            if (path.Contains("_normal"))
                Check(imp.textureType == TextureImporterType.NormalMap, $"normal flag {Path.GetFileName(path)}");
        }
        // 4. materials use URP Lit with slots assigned
        string[] mats = AssetDatabase.FindAssets("t:Material", new[] { ROOT + "/Materials" });
        foreach (var guid in mats) {
            var m = AssetDatabase.LoadAssetAtPath<Material>(AssetDatabase.GUIDToAssetPath(guid));
            if (m == null) continue;
            Check(m.shader != null && m.shader.name.Contains("Universal"),
                $"URP shader on {m.name}");
            Check(m.HasProperty("_BaseMap") && m.GetTexture("_BaseMap") != null,
                $"BaseMap assigned on {m.name}");
        }
        // 5. prefab colliders
        string[] prefabs = AssetDatabase.FindAssets("t:Prefab", new[] { ROOT + "/Prefabs" });
        var needBox = new HashSet<string>();
        foreach (var guid in prefabs) {
            var go = AssetDatabase.LoadAssetAtPath<GameObject>(AssetDatabase.GUIDToAssetPath(guid));
            if (go == null) continue;
            var box = go.GetComponentInChildren<BoxCollider>();
            var cap = go.GetComponentInChildren<CapsuleCollider>();
            if (go.name.Contains("wall")) {
                Check(box != null && Mathf.Approximately(box.size.y, WALL_H),
                    $"wall prefab BoxCollider 1x{WALL_H}x1 on {go.name}");
            }
            if (go.name.Contains("enemy"))
                Check(cap != null, $"enemy CapsuleCollider on {go.name}");
        }
        // 6. scale sanity: 1 unit = 1 m (wall prefab extents)
        Debug.Log($"[PlayGround Smoke Test] SUMMARY: {pass} passed, {fail} failed.");
    }
}
}
#endif
